import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@jothidam.test';
  // Overridable so a real deployment's seed run doesn't commit a known
  // password to source — local dev keeps working unchanged if unset.
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'admin123';
  const adminHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { isAdmin: true },
    create: {
      name: 'நிர்வாகி',
      email: adminEmail,
      mobile: '9000000001',
      passwordHash: adminHash,
      isAdmin: true
    }
  });

  const astrologers = [
    {
      name: 'ஜோதிடர் ராமசாமி',
      specialization: 'ஜாதக ஆராய்ச்சி, திருமண பொருத்தம்',
      experienceYrs: 25,
      ratePerHour: 500,
      bio: '25 ஆண்டுகள் அனுபவம் கொண்ட மூத்த ஜோதிடர். தமிழ் பாரம்பரிய ஜோதிடத்தில் தேர்ச்சி.'
    },
    {
      name: 'ஜோதிடர் முருகன்',
      specialization: 'நாடி ஜோதிடம், வாஸ்து',
      experienceYrs: 18,
      ratePerHour: 700,
      bio: 'நாடி ஜோதிட நிபுணர். வாஸ்து சாஸ்திர ஆலோசனை வழங்குகிறார்.'
    },
    {
      name: 'ஜோதிடர் கௌசிக்',
      specialization: 'காளசர்ப்ப தோஷம், செவ்வாய் தோஷ பரிகாரம்',
      experienceYrs: 12,
      ratePerHour: 400,
      bio: 'தோஷ பரிகாரம், சக்தி உபாசனை — 12 ஆண்டுகள் சேவை.'
    },
    {
      name: 'ஜோதிடர் லட்சுமி',
      specialization: 'மகிளா ஜோதிடம், குழந்தைப் பேறு',
      experienceYrs: 15,
      ratePerHour: 600,
      bio: 'பெண்களுக்கான ஜோதிட ஆலோசனை. மகப்பேறு, குடும்ப நல்வாழ்வு.'
    }
  ];

  for (const a of astrologers) {
    const existing = await prisma.astrologer.findFirst({ where: { name: a.name } });
    if (!existing) await prisma.astrologer.create({ data: a });
  }

  console.log(`✔ Seed complete.`);
  console.log(`  Admin: ${adminEmail} / ${adminPassword}`);
  console.log(`  Astrologers: ${astrologers.length}`);
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
