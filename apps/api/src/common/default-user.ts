import type { PrismaService } from "./prisma.service";

export async function getDefaultUser(prisma: PrismaService) {
  if (!prisma.isReady()) {
    return null;
  }

  const existing = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" }
  });

  if (existing) {
    return existing;
  }

  return prisma.user.create({
    data: {
      email: "local@devradar.local",
      name: "Local Developer"
    }
  });
}
