



const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@sonora.app' },
    update: {},
    create: {
      email: 'demo@sonora.app',
      username: 'demo',
      passwordHash,
      displayName: 'Demo User',
      bio: 'Just here to test out Sonora 🎧',
    },
  });

  console.log('Seeded demo user:', { email: user.email, password: 'password123' });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
