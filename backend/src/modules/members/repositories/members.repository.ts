import { prisma } from '@infrastructure/database/prisma.service';
import { AuthorizationError } from '@shared/utils/errors';
import { injectable } from 'tsyringe';

@injectable()
export class MembersRepository {
  constructor() {}

  async listCompanyMembers(
    user: { id: string; role_id: number; company_id: string | null },
    filters: { status_id?: number; role_id?: number }
  ) {
    const where: any = {};
    if (user.role_id !== 1) {
      if (!user.company_id) throw new AuthorizationError('회사 식별 불가');
      where.company_id = user.company_id;
    }
    if (filters.status_id) where.status_id = filters.status_id;
    if (filters.role_id) where.role_id = filters.role_id;

    const members = await prisma.user.findMany({
      where,
      include: {
        role: true,
        status: true,
        allocatedProjects: true,
        tasks: { include: { status: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    const data = members.map((u) => {
      const tasks_assigned = u.tasks.length;
      const tasks_completed = u.tasks.filter((t) => t.status?.status_name === 'Completed').length;
      const projects_assigned = new Set(u.allocatedProjects.map((ap) => ap.project_id)).size;
      return {
        id: u.id,
        email: u.email,
        user_name: u.user_name,
        phone_number: u.phone_number,
        role_id: u.role_id,
        role_name: u.role.role_name,
        status_id: u.status_id,
        status_name: u.status.status_name,
        created_at: u.created_at.toISOString(),
        projects_assigned,
        tasks_assigned,
        tasks_completed,
      };
    });

    const counts = await prisma.user.groupBy({
      by: ['status_id', 'role_id'],
      where,
      _count: { _all: true },
    });
    const total = data.length;
    const statistics = {
      total_members: total,
      active_members: counts.filter((c: any) => c.status_id === 1).reduce((s, c) => s + c._count._all, 0),
      pending_members: counts.filter((c: any) => c.status_id === 3).reduce((s, c) => s + c._count._all, 0),
      managers: counts.filter((c: any) => c.role_id === 2).reduce((s, c) => s + c._count._all, 0),
      team_members: counts.filter((c: any) => c.role_id === 3).reduce((s, c) => s + c._count._all, 0),
    };

    return { members: data, total, statistics };
  }

  async listPendingMembers(user: { id: string; role_id: number; company_id: string | null }) {
    const where: any = { company_id: user.company_id, status_id: 3 };
    const rows = await prisma.user.findMany({
      where,
      include: { role: true, status: true },
      orderBy: { created_at: 'asc' },
    });
    const pending_members = rows.map((u) => ({
      id: u.id,
      email: u.email,
      user_name: u.user_name,
      phone_number: u.phone_number,
      role_id: u.role_id,
      role_name: u.role.role_name,
      status_id: u.status_id,
      status_name: u.status.status_name,
      created_at: u.created_at.toISOString(),
      days_waiting: Math.ceil((Date.now() - u.created_at.getTime()) / (1000 * 3600 * 24)),
    }));
    return { pending_members, total: pending_members.length };
  }
}
