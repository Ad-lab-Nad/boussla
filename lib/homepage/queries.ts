import { prisma } from "@/lib/prisma";

/** All blocks (active or not), for the admin list. */
export async function getAllHomepageBlocks() {
  return prisma.homepageBlock.findMany({ orderBy: { order: "asc" } });
}

/** Active blocks only, for the public homepage. */
export async function getActiveHomepageBlocks() {
  return prisma.homepageBlock.findMany({ where: { active: true }, orderBy: { order: "asc" } });
}
