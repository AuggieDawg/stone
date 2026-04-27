import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const images = ["/rigs/rig-1.jpg", "/rigs/rig-2.jpg"];

const rigs = await prisma.rig.findMany({
  orderBy: [{ createdAt: "asc" }],
  select: { id: true, name: true, imageUrl: true },
});

for (const [index, rig] of rigs.entries()) {
  const imageUrl = rig.imageUrl || images[index % images.length];

  await prisma.rig.update({
    where: { id: rig.id },
    data: { imageUrl },
  });

  console.log(`Assigned ${imageUrl} to ${rig.name}`);
}

await prisma.$disconnect();
