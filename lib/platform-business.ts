import { cache } from "react";
import { prisma } from "@/lib/prisma";

// The platform itself, tracked as one more Business so the back office can
// reuse the exact same Order/Expense tables and net-profit math the app
// applies to its users: each subscription payment is a paid Order, each
// platform cost an Expense. It has no BusinessMembership, so no account can
// ever reach it through getCurrentBusiness / the /gestion screens.
const PLATFORM_BUSINESS_ID = "platform-back-office";

export const getPlatformBusinessId = cache(async function getPlatformBusinessId() {
  await prisma.business.upsert({
    where: { id: PLATFORM_BUSINESS_ID },
    update: {},
    create: { id: PLATFORM_BUSINESS_ID, name: "Back office (plateforme)" },
  });
  return PLATFORM_BUSINESS_ID;
});
