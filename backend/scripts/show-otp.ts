import prisma from '../src/lib/prisma.js';

const v = await prisma.verification.findFirst({
  orderBy: { expiresAt: 'desc' }
});

if (v) {
  const expired = v.expiresAt < new Date();
  console.log('\n╔═══════════════════════════╗');
  console.log('║   LATEST OTP FROM DB      ║');
  console.log('╠═══════════════════════════╣');
  console.log(`║ Phone:   ${v.identifier.padEnd(16)}║`);
  console.log(`║ Code:    ${v.value.padEnd(16)}║`);
  console.log(`║ Status:  ${(expired ? 'EXPIRED' : 'VALID   ').padEnd(16)}║`);
  console.log('╚═══════════════════════════╝\n');
} else {
  console.log('\nNo OTP found. Submit the registration form first.\n');
}

process.exit(0);
