import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

export async function seedUsers(prisma: PrismaClient) {
  // Hash da senha padrão (SenhaSegura123#)
  const hashedPassword = await bcrypt.hash('SenhaSegura123#', 10);

  // Usuários de exemplo
  const users = [
    {
      name: 'Administrador',
      email: 'admin@cinema.com',
      cellphone: '11999999999',
      password: hashedPassword,
    },
    {
      name: 'Daniel Vitor',
      email: 'danielvitorpnn@gmail.com',
      cellphone: '11988888888',
      password: hashedPassword,
    },
    {
      name: 'Maria Santos',
      email: 'maria.santos@gorilla.com',
      cellphone: '11977777777',
      password: hashedPassword,
    },
    {
      name: 'Pedro Costa',
      email: 'pedro.costa@cinema.com',
      cellphone: '11966666666',
      password: hashedPassword,
    },
    {
      name: 'Ana Oliveira',
      email: 'ana.oliveira@cinema.com',
      cellphone: null,
      password: hashedPassword,
    },
  ];

  // Criar usuários
  for (const userData of users) {
    const existingUser = await prisma.user.findFirst({
      where: { email: userData.email },
    });

    if (!existingUser) {
      const user = await prisma.user.create({
        data: {
          ...userData,
        },
      });
      console.log(`✅ Usuário criado: ${user.name} (${user.email})`);
    } else {
      console.log(`⏭️  Usuário já existe: ${userData.email}`);
    }
  }

  console.log('🎉 Seed de usuários finalizada!');
  console.log('📝 Senha padrão para todos os usuários: SenhaSegura123#');
}
