"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/current-business";
import { assertPalier2Access } from "@/lib/subscription-access";
import { parseDateInput, todayStr } from "@/lib/gestion/format";
import { EXPENSE_CATEGORY_VALUES } from "@/lib/gestion/expense-categories";
import { SELL_UNIT_VALUES } from "@/lib/gestion/product-units";
import { findRecurringExpenseSuggestion } from "@/lib/gestion/queries";
import { uploadReceipt } from "@/lib/gestion/receipts";
import type { ExpenseCategory, SellUnit } from "@prisma/client";

function revalidateGestion(path?: string) {
  revalidatePath("/gestion");
  if (path) revalidatePath(path);
}

function num(formData: FormData, key: string): number {
  return Number(formData.get(key)) || 0;
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function dateOf(formData: FormData, key: string) {
  const value = str(formData, key) || todayStr();
  return parseDateInput(value);
}

// ---------- PRODUITS ----------

function sellUnitOf(formData: FormData): SellUnit {
  const raw = str(formData, "sellUnit");
  return (SELL_UNIT_VALUES.includes(raw) ? raw : "PIECE") as SellUnit;
}

export async function createProduct(formData: FormData) {
  await assertPalier2Access();
  const business = await getCurrentBusiness();
  const name = str(formData, "name");
  if (!name) throw new Error("Indiquez un nom de produit.");
  await prisma.product.create({
    data: {
      businessId: business.id,
      name,
      sellPrice: num(formData, "sellPrice"),
      unitCost: num(formData, "unitCost"),
      sellUnit: sellUnitOf(formData),
    },
  });
  revalidateGestion("/gestion/produits");
}

export async function deleteProduct(formData: FormData) {
  await assertPalier2Access();
  const business = await getCurrentBusiness();
  const id = str(formData, "id");
  await prisma.product.deleteMany({ where: { id, businessId: business.id } });
  revalidateGestion("/gestion/produits");
}

// Only touches the products table — OrderLine keeps its own
// productNameSnapshot/sellPriceSnapshot/unitCostSnapshot captured at order
// time, so editing a product here never rewrites past orders. Future orders
// simply read the product's new values when they snapshot them.
export async function updateProduct(formData: FormData) {
  await assertPalier2Access();
  const business = await getCurrentBusiness();
  const id = str(formData, "id");
  const name = str(formData, "name");
  if (!name) throw new Error("Indiquez un nom de produit.");
  await prisma.product.updateMany({
    where: { id, businessId: business.id },
    data: {
      name,
      sellPrice: num(formData, "sellPrice"),
      unitCost: num(formData, "unitCost"),
      sellUnit: sellUnitOf(formData),
    },
  });
  revalidateGestion("/gestion/produits");
}

/**
 * Bulk-creates products from a validated Excel/CSV import preview. Called
 * directly from the import dialog (not a <form>), so it takes plain data
 * rather than FormData. Only rows the client already marked valid should be
 * passed in — this re-validates anyway, since a Server Function is reachable
 * directly and must never trust its caller.
 */
export async function bulkCreateProducts(
  rows: { name: string; sellPrice: number; unitCost: number }[]
): Promise<{ count: number }> {
  await assertPalier2Access();
  const business = await getCurrentBusiness();

  const valid = rows.filter(
    (r) =>
      typeof r.name === "string" &&
      r.name.trim() &&
      Number.isFinite(r.sellPrice) &&
      r.sellPrice >= 0 &&
      Number.isFinite(r.unitCost) &&
      r.unitCost >= 0
  );
  if (valid.length === 0) return { count: 0 };

  const result = await prisma.product.createMany({
    data: valid.map((r) => ({
      businessId: business.id,
      name: r.name.trim(),
      sellPrice: r.sellPrice,
      unitCost: r.unitCost,
    })),
  });
  revalidateGestion("/gestion/produits");
  return { count: result.count };
}

// ---------- COMMANDES ----------

type OrderLineInput = { productId: string; quantity: number };

export async function createOrder(formData: FormData) {
  await assertPalier2Access();
  const business = await getCurrentBusiness();
  const date = dateOf(formData, "date");
  const clientName = str(formData, "clientName") || null;
  const status = str(formData, "status") || "IN_PROGRESS";
  const paymentStatus = str(formData, "paymentStatus") || "PENDING";
  const paymentMethodRaw = str(formData, "paymentMethod");
  const paymentMethod = ["CASH", "CHECK", "TRANSFER", "OTHER"].includes(paymentMethodRaw)
    ? paymentMethodRaw
    : "CASH";
  const checkDueDateStr = str(formData, "checkDueDate");
  const checkDueDate = paymentMethod === "CHECK" && checkDueDateStr ? parseDateInput(checkDueDateStr) : null;

  let rawLines: OrderLineInput[] = [];
  try {
    rawLines = JSON.parse(str(formData, "linesJson") || "[]");
  } catch {
    rawLines = [];
  }
  const validLines = rawLines.filter((l) => l.productId && l.quantity > 0);
  if (validLines.length === 0) {
    throw new Error("Ajoutez au moins un parfum avec une quantité valide.");
  }

  const products = await prisma.product.findMany({
    where: { businessId: business.id, id: { in: validLines.map((l) => l.productId) } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  await prisma.order.create({
    data: {
      businessId: business.id,
      date,
      clientName,
      status: status as "IN_PROGRESS" | "DELIVERED" | "RETURNED",
      paymentStatus: paymentStatus as "PAID" | "PENDING" | "UNPAID",
      paymentDate: paymentStatus === "PAID" ? new Date() : null,
      paymentMethod: paymentMethod as "CASH" | "CHECK" | "TRANSFER" | "OTHER",
      checkDueDate,
      lines: {
        create: validLines.map((l) => {
          const product = byId.get(l.productId);
          return {
            productId: product ? product.id : null,
            productNameSnapshot: product ? product.name : "(produit supprimé)",
            quantity: l.quantity,
            sellPriceSnapshot: product ? product.sellPrice : 0,
            unitCostSnapshot: product ? product.unitCost : 0,
            sellUnitSnapshot: product ? product.sellUnit : "PIECE",
          };
        }),
      },
    },
  });
  revalidateGestion("/gestion/commandes");
}

export async function updateOrderStatus(formData: FormData) {
  await assertPalier2Access();
  const business = await getCurrentBusiness();
  const id = str(formData, "id");
  const status = str(formData, "status");
  await prisma.order.updateMany({
    where: { id, businessId: business.id },
    data: { status: status as "IN_PROGRESS" | "DELIVERED" | "RETURNED" },
  });
  revalidateGestion("/gestion/commandes");
}

export async function updateOrderPaymentStatus(formData: FormData) {
  await assertPalier2Access();
  const business = await getCurrentBusiness();
  const id = str(formData, "id");
  const paymentStatus = str(formData, "paymentStatus") as "PAID" | "PENDING" | "UNPAID";
  const order = await prisma.order.findFirst({ where: { id, businessId: business.id } });
  if (!order) return;
  await prisma.order.update({
    where: { id },
    data: {
      paymentStatus,
      paymentDate: paymentStatus === "PAID" ? order.paymentDate ?? new Date() : order.paymentDate,
    },
  });
  revalidateGestion("/gestion/commandes");
}

export async function deleteOrder(formData: FormData) {
  await assertPalier2Access();
  const business = await getCurrentBusiness();
  const id = str(formData, "id");
  await prisma.order.deleteMany({ where: { id, businessId: business.id } });
  revalidateGestion("/gestion/commandes");
}

// Replaces the order's own lines with freshly snapshotted ones from current
// product data — this is an explicit edit of this order, not a bystander
// catalog change, so re-deriving productNameSnapshot/sellPriceSnapshot/
// unitCostSnapshot here is intentional and matches what createOrder does.
// Other orders' lines are untouched.
export async function updateOrder(formData: FormData) {
  await assertPalier2Access();
  const business = await getCurrentBusiness();
  const id = str(formData, "id");
  const order = await prisma.order.findFirst({ where: { id, businessId: business.id } });
  if (!order) throw new Error("Commande introuvable.");

  const date = dateOf(formData, "date");
  const clientName = str(formData, "clientName") || null;
  const status = str(formData, "status") || order.status;
  const paymentStatus = str(formData, "paymentStatus") || order.paymentStatus;
  const paymentMethodRaw = str(formData, "paymentMethod");
  const paymentMethod = ["CASH", "CHECK", "TRANSFER", "OTHER"].includes(paymentMethodRaw)
    ? paymentMethodRaw
    : "CASH";
  const checkDueDateStr = str(formData, "checkDueDate");
  const checkDueDate = paymentMethod === "CHECK" && checkDueDateStr ? parseDateInput(checkDueDateStr) : null;

  let rawLines: OrderLineInput[] = [];
  try {
    rawLines = JSON.parse(str(formData, "linesJson") || "[]");
  } catch {
    rawLines = [];
  }
  const validLines = rawLines.filter((l) => l.productId && l.quantity > 0);
  if (validLines.length === 0) {
    throw new Error("Ajoutez au moins un parfum avec une quantité valide.");
  }

  const products = await prisma.product.findMany({
    where: { businessId: business.id, id: { in: validLines.map((l) => l.productId) } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  await prisma.$transaction([
    prisma.orderLine.deleteMany({ where: { orderId: id } }),
    prisma.order.update({
      where: { id },
      data: {
        date,
        clientName,
        status: status as "IN_PROGRESS" | "DELIVERED" | "RETURNED",
        paymentStatus: paymentStatus as "PAID" | "PENDING" | "UNPAID",
        paymentDate: paymentStatus === "PAID" ? order.paymentDate ?? new Date() : order.paymentDate,
        paymentMethod: paymentMethod as "CASH" | "CHECK" | "TRANSFER" | "OTHER",
        checkDueDate,
        lines: {
          create: validLines.map((l) => {
            const product = byId.get(l.productId);
            return {
              productId: product ? product.id : null,
              productNameSnapshot: product ? product.name : "(produit supprimé)",
              quantity: l.quantity,
              sellPriceSnapshot: product ? product.sellPrice : 0,
              unitCostSnapshot: product ? product.unitCost : 0,
              sellUnitSnapshot: product ? product.sellUnit : "PIECE",
            };
          }),
        },
      },
    }),
  ]);
  revalidateGestion("/gestion/commandes");
}

// ---------- STOCK (matières premières) ----------

export async function createStockItem(formData: FormData) {
  await assertPalier2Access();
  const business = await getCurrentBusiness();
  const name = str(formData, "name");
  if (!name) throw new Error("Indiquez un nom.");
  await prisma.stockItem.create({
    data: {
      businessId: business.id,
      name,
      unit: str(formData, "unit") || "unité",
      alertThreshold: num(formData, "alertThreshold"),
    },
  });
  revalidateGestion("/gestion/stock");
}

export async function deleteStockItem(formData: FormData) {
  await assertPalier2Access();
  const business = await getCurrentBusiness();
  const id = str(formData, "id");
  await prisma.stockItem.deleteMany({ where: { id, businessId: business.id } });
  revalidateGestion("/gestion/stock");
}

// Only touches the stockItem's own row. StockItem's aggregate totals
// (purchased/used/remaining) are computed live from its purchases/usages
// each time they're read, never cached — so this needs no snapshot
// protection the way OrderLine does.
export async function updateStockItem(formData: FormData) {
  await assertPalier2Access();
  const business = await getCurrentBusiness();
  const id = str(formData, "id");
  const name = str(formData, "name");
  if (!name) throw new Error("Indiquez un nom.");
  await prisma.stockItem.updateMany({
    where: { id, businessId: business.id },
    data: {
      name,
      unit: str(formData, "unit") || "unité",
      alertThreshold: num(formData, "alertThreshold"),
    },
  });
  revalidateGestion("/gestion/stock");
}

export async function createStockPurchase(formData: FormData) {
  await assertPalier2Access();
  const business = await getCurrentBusiness();
  const stockItemId = str(formData, "stockItemId");
  const quantity = num(formData, "quantity");
  const item = await prisma.stockItem.findFirst({ where: { id: stockItemId, businessId: business.id } });
  if (!item || quantity <= 0) {
    throw new Error("Choisissez une matière et une quantité valide.");
  }
  await prisma.stockPurchase.create({
    data: {
      stockItemId: item.id,
      date: dateOf(formData, "date"),
      quantity,
      unitCost: num(formData, "unitCost"),
    },
  });
  revalidateGestion("/gestion/stock");
}

// Corrects primary source data (a purchase actually made) — StockItem
// totals are always recomputed live from purchases/usages, so this simply
// changes what future reads see; no retroactive recalculation to guard
// against, unlike OrderLine's frozen snapshots.
export async function updateStockPurchase(formData: FormData) {
  await assertPalier2Access();
  const business = await getCurrentBusiness();
  const id = str(formData, "id");
  const quantity = num(formData, "quantity");
  if (quantity <= 0) throw new Error("Quantité invalide.");
  await prisma.stockPurchase.updateMany({
    where: { id, stockItem: { businessId: business.id } },
    data: {
      date: dateOf(formData, "date"),
      quantity,
      unitCost: num(formData, "unitCost"),
    },
  });
  revalidateGestion("/gestion/stock");
}

export async function deleteStockPurchase(formData: FormData) {
  await assertPalier2Access();
  const business = await getCurrentBusiness();
  const id = str(formData, "id");
  await prisma.stockPurchase.deleteMany({ where: { id, stockItem: { businessId: business.id } } });
  revalidateGestion("/gestion/stock");
}

export async function createStockUsage(formData: FormData) {
  await assertPalier2Access();
  const business = await getCurrentBusiness();
  const stockItemId = str(formData, "stockItemId");
  const quantity = num(formData, "quantity");
  const item = await prisma.stockItem.findFirst({ where: { id: stockItemId, businessId: business.id } });
  if (!item || quantity <= 0) {
    throw new Error("Choisissez une matière et une quantité valide.");
  }
  await prisma.stockUsage.create({
    data: {
      stockItemId: item.id,
      date: dateOf(formData, "date"),
      quantity,
    },
  });
  revalidateGestion("/gestion/stock");
}

export async function updateStockUsage(formData: FormData) {
  await assertPalier2Access();
  const business = await getCurrentBusiness();
  const id = str(formData, "id");
  const quantity = num(formData, "quantity");
  if (quantity <= 0) throw new Error("Quantité invalide.");
  await prisma.stockUsage.updateMany({
    where: { id, stockItem: { businessId: business.id } },
    data: {
      date: dateOf(formData, "date"),
      quantity,
    },
  });
  revalidateGestion("/gestion/stock");
}

export async function deleteStockUsage(formData: FormData) {
  await assertPalier2Access();
  const business = await getCurrentBusiness();
  const id = str(formData, "id");
  await prisma.stockUsage.deleteMany({ where: { id, stockItem: { businessId: business.id } } });
  revalidateGestion("/gestion/stock");
}

// ---------- STOCK PRODUITS FINIS ----------

export async function createProductionBatch(formData: FormData) {
  await assertPalier2Access();
  const business = await getCurrentBusiness();
  const productId = str(formData, "productId");
  const quantity = num(formData, "quantity");
  const product = await prisma.product.findFirst({ where: { id: productId, businessId: business.id } });
  if (!product || quantity <= 0) {
    throw new Error("Choisissez un produit et une quantité valide.");
  }
  await prisma.productionBatch.create({
    data: {
      productId: product.id,
      date: dateOf(formData, "date"),
      quantity,
    },
  });
  revalidateGestion("/gestion/produits-finis");
}

export async function deleteProductionBatch(formData: FormData) {
  await assertPalier2Access();
  const business = await getCurrentBusiness();
  const id = str(formData, "id");
  await prisma.productionBatch.deleteMany({ where: { id, product: { businessId: business.id } } });
  revalidateGestion("/gestion/produits-finis");
}

export async function updateProductionBatch(formData: FormData) {
  await assertPalier2Access();
  const business = await getCurrentBusiness();
  const id = str(formData, "id");
  const productId = str(formData, "productId");
  const quantity = num(formData, "quantity");
  const product = await prisma.product.findFirst({ where: { id: productId, businessId: business.id } });
  if (!product || quantity <= 0) {
    throw new Error("Choisissez un produit et une quantité valide.");
  }
  await prisma.productionBatch.updateMany({
    where: { id, product: { businessId: business.id } },
    data: {
      productId: product.id,
      date: dateOf(formData, "date"),
      quantity,
    },
  });
  revalidateGestion("/gestion/produits-finis");
}

// ---------- DEPENSES ----------

const EXPENSE_CATEGORIES = EXPENSE_CATEGORY_VALUES;

/** null when the "plusieurs mois" checkbox isn't checked; otherwise the
 * validated month count (>= 2) to spread the amount across. */
function spreadMonthsOf(formData: FormData): number | null {
  if (formData.get("isSpread") !== "on") return null;
  const months = Math.trunc(num(formData, "spreadMonths"));
  if (months < 2) {
    throw new Error("Indique sur combien de mois étaler cette dépense (au moins 2).");
  }
  return months;
}

export async function createExpense(formData: FormData) {
  const business = await getCurrentBusiness();
  const description = str(formData, "description");
  const amount = num(formData, "amount");
  const categoryRaw = str(formData, "category");
  const category = EXPENSE_CATEGORIES.includes(categoryRaw) ? categoryRaw : "OTHER";
  if (!description || amount <= 0) {
    throw new Error("Remplissez la description et le montant.");
  }
  if (!categoryRaw) {
    throw new Error("Choisissez une catégorie.");
  }
  const spreadMonths = spreadMonthsOf(formData);
  const isPersonal = formData.get("isPersonal") === "on";
  const receiptFile = formData.get("receipt");
  const receiptPath =
    receiptFile instanceof File && receiptFile.size > 0
      ? await uploadReceipt(business.id, receiptFile)
      : null;
  await prisma.expense.create({
    data: {
      businessId: business.id,
      date: dateOf(formData, "date"),
      description,
      amount,
      category: category as ExpenseCategory,
      spreadMonths,
      isPersonal,
      receiptPath,
    },
  });
  revalidateGestion("/gestion/depenses");
}

export async function updateExpense(formData: FormData) {
  const business = await getCurrentBusiness();
  const id = str(formData, "id");
  const description = str(formData, "description");
  const amount = num(formData, "amount");
  const categoryRaw = str(formData, "category");
  if (!description || amount <= 0) {
    throw new Error("Remplissez la description et le montant.");
  }
  if (!EXPENSE_CATEGORIES.includes(categoryRaw)) {
    throw new Error("Choisissez une catégorie.");
  }
  const spreadMonths = spreadMonthsOf(formData);
  const isPersonal = formData.get("isPersonal") === "on";
  const receiptFile = formData.get("receipt");
  // Only replaces the stored receipt when a new file is actually attached —
  // omitting the field entirely (rather than setting it to null) leaves an
  // existing receiptPath untouched.
  const receiptPath =
    receiptFile instanceof File && receiptFile.size > 0
      ? await uploadReceipt(business.id, receiptFile)
      : undefined;
  await prisma.expense.updateMany({
    where: { id, businessId: business.id },
    data: {
      date: dateOf(formData, "date"),
      description,
      amount,
      category: categoryRaw as ExpenseCategory,
      spreadMonths,
      isPersonal,
      ...(receiptPath !== undefined ? { receiptPath } : {}),
    },
  });
  revalidateGestion("/gestion/depenses");
}

export async function deleteExpense(formData: FormData) {
  const business = await getCurrentBusiness();
  const id = str(formData, "id");
  await prisma.expense.deleteMany({ where: { id, businessId: business.id } });
  revalidateGestion("/gestion/depenses");
}

// ---------- OBJECTIF MENSUEL ----------

export async function setMonthlyGoal(formData: FormData) {
  const business = await getCurrentBusiness();
  const month = str(formData, "month");
  const targetRevenue = num(formData, "targetRevenue");
  if (!/^\d{4}-\d{2}$/.test(month)) throw new Error("Mois invalide.");
  if (targetRevenue <= 0) {
    throw new Error("Indique un objectif de chiffre d'affaires valide.");
  }
  await prisma.monthlyGoal.upsert({
    where: { businessId_month: { businessId: business.id, month } },
    update: { targetRevenue },
    create: { businessId: business.id, month, targetRevenue },
  });
  revalidateGestion("/gestion");
}

// ---------- CLIENTS & CREANCES ----------

export async function createClient(formData: FormData) {
  await assertPalier2Access();
  const business = await getCurrentBusiness();
  const name = str(formData, "name");
  if (!name) throw new Error("Indique un nom de client.");
  await prisma.client.create({
    data: {
      businessId: business.id,
      name,
      phone: str(formData, "phone") || null,
      email: str(formData, "email") || null,
    },
  });
  revalidateGestion("/gestion/clients");
}

export async function updateClient(formData: FormData) {
  await assertPalier2Access();
  const business = await getCurrentBusiness();
  const id = str(formData, "id");
  const name = str(formData, "name");
  if (!name) throw new Error("Indique un nom de client.");
  await prisma.client.updateMany({
    where: { id, businessId: business.id },
    data: {
      name,
      phone: str(formData, "phone") || null,
      email: str(formData, "email") || null,
    },
  });
  revalidateGestion("/gestion/clients");
}

export async function deleteClient(formData: FormData) {
  await assertPalier2Access();
  const business = await getCurrentBusiness();
  const id = str(formData, "id");
  await prisma.client.deleteMany({ where: { id, businessId: business.id } });
  revalidateGestion("/gestion/clients");
}

const RECEIVABLE_STATUSES = ["PENDING", "PARTIAL", "PAID"];

export async function createReceivable(formData: FormData) {
  await assertPalier2Access();
  const business = await getCurrentBusiness();
  const clientId = str(formData, "clientId");
  const amount = num(formData, "amount");
  const client = await prisma.client.findFirst({ where: { id: clientId, businessId: business.id } });
  if (!client || amount <= 0) {
    throw new Error("Choisis un client et un montant valide.");
  }
  await prisma.receivable.create({
    data: {
      clientId: client.id,
      amount,
      dueDate: dateOf(formData, "dueDate"),
      note: str(formData, "note") || null,
    },
  });
  revalidateGestion("/gestion/clients");
}

export async function updateReceivable(formData: FormData) {
  await assertPalier2Access();
  const business = await getCurrentBusiness();
  const id = str(formData, "id");
  const amount = num(formData, "amount");
  const amountPaid = num(formData, "amountPaid");
  const statusRaw = str(formData, "status");
  const status = RECEIVABLE_STATUSES.includes(statusRaw) ? statusRaw : "PENDING";
  if (amount <= 0) throw new Error("Indique un montant valide.");
  await prisma.receivable.updateMany({
    where: { id, client: { businessId: business.id } },
    data: {
      amount,
      amountPaid,
      dueDate: dateOf(formData, "dueDate"),
      status: status as "PENDING" | "PARTIAL" | "PAID",
      note: str(formData, "note") || null,
    },
  });
  revalidateGestion("/gestion/clients");
}

/** Quick shortcut from the table row — marks fully paid without opening the edit modal. */
export async function markReceivablePaid(formData: FormData) {
  await assertPalier2Access();
  const business = await getCurrentBusiness();
  const id = str(formData, "id");
  const receivable = await prisma.receivable.findFirst({ where: { id, client: { businessId: business.id } } });
  if (!receivable) return;
  await prisma.receivable.update({
    where: { id },
    data: { status: "PAID", amountPaid: receivable.amount },
  });
  revalidateGestion("/gestion/clients");
}

export async function deleteReceivable(formData: FormData) {
  await assertPalier2Access();
  const business = await getCurrentBusiness();
  const id = str(formData, "id");
  await prisma.receivable.deleteMany({ where: { id, client: { businessId: business.id } } });
  revalidateGestion("/gestion/clients");
}

// ---------- VENTE RAPIDE (Palier 1) ----------

/**
 * A quick sale is stored as a one-line Order rather than a separate table —
 * OrderLine.productId is already nullable with an established "(produit
 * supprimé)" fallback convention, so a synthetic line fits cleanly and every
 * revenue computation (computeDashboardTotals, totalsForMonth) already
 * handles it correctly with unitCostSnapshot: 0.
 */
export async function createQuickSale(formData: FormData) {
  const business = await getCurrentBusiness();
  const amount = num(formData, "amount");
  if (amount <= 0) throw new Error("Indique un montant de vente valide.");
  await prisma.order.create({
    data: {
      businessId: business.id,
      date: dateOf(formData, "date"),
      status: "DELIVERED",
      paymentStatus: "PAID",
      paymentDate: new Date(),
      paymentMethod: "CASH",
      lines: {
        create: [
          {
            productId: null,
            productNameSnapshot: "Vente rapide",
            quantity: 1,
            sellPriceSnapshot: amount,
            unitCostSnapshot: 0,
            sellUnitSnapshot: "PIECE",
          },
        ],
      },
    },
  });
  revalidateGestion();
}

/**
 * Looks up the most recent expense with the same description, so the
 * Palier 1 form can propose its category/amount/pro-perso — the user always
 * confirms or edits, never auto-applied/auto-saved.
 */
export async function suggestRecurringExpense(description: string) {
  const business = await getCurrentBusiness();
  return findRecurringExpenseSuggestion(business.id, description);
}
