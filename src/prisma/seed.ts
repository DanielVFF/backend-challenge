import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seeds/userSeeds';

const prisma = new PrismaClient();

async function main() {
  await seedUsers(prisma);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
