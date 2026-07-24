import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireAdmin } from '../../../../lib/auth';

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (!guard.ok) return guard.response;

  try {
    const [users, reports, payments] = await Promise.all([
      prisma.user.count(),
      prisma.report.count(),
      prisma.payment.aggregate({ _sum: { amount: true } })
    ]);
    return NextResponse.json({
      totalUsers: users,
      totalReports: reports,
      totalRevenue: payments._sum.amount || 0
    });
  } catch {
    return NextResponse.json({ error: 'புள்ளிவிவரம் கிடைக்கவில்லை' }, { status: 500 });
  }
}
