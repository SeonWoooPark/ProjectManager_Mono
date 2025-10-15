import { prisma } from '@infrastructure/database/prisma.service';
import { AuthorizationError, NotFoundError } from '@shared/utils/errors';
import { UserRole } from '@modules/auth/interfaces/auth.types';
import { injectable } from 'tsyringe';
import { User } from '@prisma/client';

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

  async assertProjectAccess(user: { id: string; role_id: number; company_id: string | null }, projectId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundError('프로젝트를 찾을 수 없습니다', 'project');
    if (user.role_id === UserRole.SYSTEM_ADMIN) return project;
    if (!user.company_id || project.company_id !== user.company_id) {
      throw new AuthorizationError('프로젝트 접근 권한이 없습니다');
    }
    return project;
  }

  async getProjectMembers(
    user: { id: string; role_id: number; company_id: string | null },
    projectId: string
  ) {
    await this.assertProjectAccess(user, projectId);
    const projectRow = await prisma.project.findUnique({ where: { id: projectId } });
    const allocations = await prisma.allocateProject.findMany({
      where: { project_id: projectId },
      include: { user: { include: { role: true, status: true } } },
      orderBy: { allocated_at: 'asc' },
    });

    const members = allocations.map((ap) => ({
      id: ap.user_id,
      email: ap.user.email,
      user_name: ap.user.user_name,
      role_name: ap.user.role.role_name,
      status_name: ap.user.status.status_name,
      allocated_at: ap.allocated_at.toISOString(),
      // counts in project
      // compute tasks_in_project and completed count per member
    }));

    // compute per member stats in project
    const memberIds = allocations.map((ap) => ap.user_id);
    const tasks = await prisma.task.findMany({
      where: { project_id: projectId, assignee_id: { in: memberIds } },
      include: { status: true },
    });

    const statusByUser: Record<string, { todo: number; in_progress: number; review: number; completed: number; total: number }> = {};
    for (const t of tasks) {
      const uid = t.assignee_id!;
      statusByUser[uid] ||= { todo: 0, in_progress: 0, review: 0, completed: 0, total: 0 };
      statusByUser[uid].total++;
      const name = t.status?.status_name || '';
      if (name === 'Todo') statusByUser[uid].todo++;
      else if (name === 'In Progress') statusByUser[uid].in_progress++;
      else if (name === 'Review') statusByUser[uid].review++;
      else if (name === 'Completed') statusByUser[uid].completed++;
    }

    const enriched = members.map((m) => ({
      ...m,
      tasks_in_project: statusByUser[m.id]?.total || 0,
      completed_tasks: statusByUser[m.id]?.completed || 0,
      current_task_status: {
        todo: statusByUser[m.id]?.todo || 0,
        in_progress: statusByUser[m.id]?.in_progress || 0,
        review: statusByUser[m.id]?.review || 0,
        completed: statusByUser[m.id]?.completed || 0,
      },
    }));

    return {
      project_id: projectId,
      project_name: projectRow?.project_name || null,
      members: enriched,
      total_members: enriched.length,
    };
  }

  async findMemberById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: { role: true, status: true },
    });
  }

  async updateMemberStatus(userId: string, statusId: number) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        status_id: statusId,
        updated_at: new Date(),
      },
      include: { role: true, status: true },
    });
  }

  async updateMemberProfile(
    userId: string,
    data: Partial<Pick<User, 'user_name' | 'phone_number' | 'email'>>
  ) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updated_at: new Date(),
      },
      include: { role: true, status: true },
    });
  }

  async findMemberByEmail(email: string, excludeUserId?: string) {
    return prisma.user.findFirst({
      where: {
        email,
        ...(excludeUserId ? { NOT: { id: excludeUserId } } : {}),
      },
    });
  }
}
