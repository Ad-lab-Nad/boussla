"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { parseDateInput, todayStr } from "@/lib/gestion/format";

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

export async function createProduct(formData: FormData) {
  const user = await getCurrentUser();
  const name = str(formData, "name");
  if (!name) throw new Error("Indiquez un nom de produit.");
  await prisma.product.create({
    data: {
      userId: user.id,
      name,
      sellPrice: num(formData, "sellPrice"),
      unitCost: num(formData, "unitCost"),
    },
  });
  revalidateGestion("/gestion/produits");
}

export async function deleteProduct(formData: FormData) {
  const user = await getCurrentUser();
  const id = str(formData, "id");
  await prisma.product.deleteMany({ where: { id, userId: user.id } });
  revalidateGestion("/gestion/produits");
}

// Only touches the products table — OrderLine keeps its own
// productNameSnapshot/sellPriceSnapshot/unitCostSnapshot captured at order
// time, so editing a product here never rewrites past orders. Future orders
// simply read the product's new values when they snapshot them.
export async function updateProduct(formData: FormData) {
  const user = await getCurrentUser();
  const id = str(formData, "id");
  const name = str(formData, "name");
  if (!name) throw new Error("Indiquez un nom de produit.");
  await prisma.product.updateMany({
    where: { id, userId: user.id },
    data: {
      name,
      sellPrice: num(formData, "sellPrice"),
      unitCost: num(formData, "unitCost"),
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
  const user = await getCurrentUser();

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
      userId: user.id,
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
  const user = await getCurrentUser();
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
    where: { userId: user.id, id: { in: validLines.map((l) => l.productId) } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  await prisma.order.create({
    data: {
      userId: user.id,
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
          };
        }),
      },
    },
  });
  revalidateGestion("/gestion/commandes");
}

export async function updateOrderStatus(formData: FormData) {
  const user = await getCurrentUser();
  const id = str(formData, "id");
  const status = str(formData, "status");
  await prisma.order.updateMany({
    where: { id, userId: user.id },
    data: { status: status as "IN_PROGRESS" | "DELIVERED" | "RETURNED" },
  });
  revalidateGestion("/gestion/commandes");
}

export async function updateOrderPaymentStatus(formData: FormData) {
  const user = await getCurrentUser();
  const id = str(formData, "id");
  const paymentStatus = str(formData, "paymentStatus") as "PAID" | "PENDING" | "UNPAID";
  const order = await prisma.order.findFirst({ where: { id, userId: user.id } });
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
  const user = await getCurrentUser();
  const id = str(formData, "id");
  await prisma.order.deleteMany({ where: { id, userId: user.id } });
  revalidateGestion("/gestion/commandes");
}

// ---------- STOCK (matières premières) ----------

export async function createStockItem(formData: FormData) {
  const user = await getCurrentUser();
  const name = str(formData, "name");
  if (!name) throw new Error("Indiquez un nom.");
  await prisma.stockItem.create({
    data: {
      userId: user.id,
      name,
      unit: str(formData, "unit") || "unité",
      alertThreshold: num(formData, "alertThreshold"),
    },
  });
  revalidateGestion("/gestion/stock");
}

export async function deleteStockItem(formData: FormData) {
  const user = await getCurrentUser();
  const id = str(formData, "id");
  await prisma.stockItem.deleteMany({ where: { id, userId: user.id } });
  revalidateGestion("/gestion/stock");
}

export async function createStockPurchase(formData: FormData) {
  const user = await getCurrentUser();
  const stockItemId = str(formData, "stockItemId");
  const quantity = num(formData, "quantity");
  const item = await prisma.stockItem.findFirst({ where: { id: stockItemId, userId: user.id } });
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

export async function createStockUsage(formData: FormData) {
  const user = await getCurrentUser();
  const stockItemId = str(formData, "stockItemId");
  const quantity = num(formData, "quantity");
  const item = await prisma.stockItem.findFirst({ where: { id: stockItemId, userId: user.id } });
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

// ---------- STOCK PRODUITS FINIS ----------

export async function createProductionBatch(formData: FormData) {
  const user = await getCurrentUser();
  const productId = str(formData, "productId");
  const quantity = Math.trunc(num(formData, "quantity"));
  const product = await prisma.product.findFirst({ where: { id: productId, userId: user.id } });
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
  const user = await getCurrentUser();
  const id = str(formData, "id");
  await prisma.productionBatch.deleteMany({ where: { id, product: { userId: user.id } } });
  revalidateGestion("/gestion/produits-finis");
}

// ---------- DEPENSES ----------

const EXPENSE_CATEGORIES = ["ADVERTISING", "TRANSPORT", "FIXED_COSTS", "STOCK_PURCHASES", "OTHER"];

export async function createExpense(formData: FormData) {
  const user = await getCurrentUser();
  const description = str(formData, "description");
  const amount = num(formData, "amount");
  const categoryRaw = str(formData, "category");
  const category = EXPENSE_CATEGORIES.includes(categoryRaw) ? categoryRaw : "OTHER";
  if (!description || amount <= 0) {
    throw new Error("Remplissez la description et le montant.");
  }
  await prisma.expense.create({
    data: {
      userId: user.id,
      date: dateOf(formData, "date"),
      description,
      amount,
      category: category as
        | "ADVERTISING"
        | "TRANSPORT"
        | "FIXED_COSTS"
        | "STOCK_PURCHASES"
        | "OTHER",
    },
  });
  revalidateGestion("/gestion/depenses");
}

export async function deleteExpense(formData: FormData) {
  const user = await getCurrentUser();
  const id = str(formData, "id");
  await prisma.expense.deleteMany({ where: { id, userId: user.id } });
  revalidateGestion("/gestion/depenses");
}
