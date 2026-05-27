import prisma from './src/lib/prisma.js';
try {
  const r = await prisma.user.findFirst();
  console.log('DB connected, result:', r);
} catch(e) {
  console.error('DB error:', e.message);
  console.error(e.stack);
} finally {
  await prisma.$disconnect();
}
