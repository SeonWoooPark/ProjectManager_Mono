import { prisma } from '@infrastructure/database/prisma.service';
import { Prisma } from '@prisma/client';
import { AuthorizationError, NotFoundError } from '@shared/utils/errors';
import { UserRole } from '@modules/auth/interfaces/auth.types';
import { injectable } from 'tsyringe';

@injectable()
export class TasksRepository {
  constructor() {}

  async listAssigned(
    user: { id: string; role_id: number; company_id: string | null },
    filters: { status_id?: number; project_id?: string }
  ) {
    // Assigned to current user
    const tasks = await prisma.task.findMany({
      where: {
        assignee_id: user.id,
        ...(filters.status_id ? { status_id: filters.status_id } : {}),
        ...(filters.project_id ? { project_id: filters.project_id } : {}),
      },
      include: { status: true, project: true },
      orderBy: { end_date: 'asc' },
    });

    const now = new Date();
    const data = tasks.map((t) => ({
      id: t.id,
      task_name: t.task_name,
      task_description: t.task_description,
      project_id: t.project_id,
      project_name: t.project.project_name,
      status_id: t.status_id || null,
      status_name: t.status?.status_name || null,
      start_date: t.start_date ? t.start_date.toISOString().slice(0, 10) : null,
      end_date: t.end_date ? t.end_date.toISOString().slice(0, 10) : null,
      progress_rate: Number(t.progress_rate || 0),
      days_remaining: t.end_date ? Math.ceil((t.end_date.getTime() - now.getTime()) / (1000 * 3600 * 24)) : null,
      created_at: t.created_at.toISOString(),
      updated_at: t.updated_at.toISOString(),
    }));

    // statistics by status_name
    const stats = { total: data.length, todo: 0, in_progress: 0, review: 0, completed: 0 };
    for (const t of tasks) {
      const name = t.status?.status_name || '';
      if (name === 'Todo') stats.todo++;
      else if (name === 'In Progress') stats.in_progress++;
      else if (name === 'Review') stats.review++;
      else if (name === 'Completed') stats.completed++;
    }

    return { tasks: data, statistics: stats };
  }

  async changeStatus(
    user: { id: string; role_id: number; company_id: string | null },
    taskId: string,
    status_id: number,
    comment?: string
  ) {
    const task = await prisma.task.findUnique({ include: { status: true, project: true }, where: { id: taskId } });
    if (!task) throw new NotFoundError('작업을 찾을 수 없습니다', 'task');

    // permission: assignee or company manager in same company
    if (!(task.assignee_id === user.id || (user.role_id === UserRole.COMPANY_MANAGER && task.project.company_id === user.company_id))) {
      throw new AuthorizationError('작업 상태 변경 권한이 없습니다');
    }

    const previous_status = task.status?.status_name || null;
    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { status_id, updated_at: new Date() },
      include: { status: true },
    });

    // Optional: create review if status_id is Review (3)
    if (status_id === 3) {
      const company = await prisma.company.findUnique({ where: { id: task.project.company_id } });
      await prisma.review.create({
        data: {
          id: `rev_${require('crypto').randomBytes(6).toString('hex')}`,
          task_id: task.id,
          status_id: status_id,
          assignee_id: task.assignee_id!,
          manager_id: company?.manager_id || user.id,
          comment: comment || null,
        },
      });
    }

    return {
      id: updated.id,
      task_name: updated.task_name,
      previous_status,
      new_status: updated.status?.status_name || null,
      status_id: updated.status_id || null,
      updated_at: updated.updated_at.toISOString(),
      updated_by: user.id,
    };
  }

  async updateTask(
    user: { id: string; role_id: number; company_id: string | null },
    taskId: string,
    body: any
  ) {
    const task = await prisma.task.findUnique({ include: { project: true, assignee: true }, where: { id: taskId } });
    if (!task) throw new NotFoundError('작업을 찾을 수 없습니다', 'task');

    // permission: manager or current assignee
    const can = task.assignee_id === user.id || (user.role_id === UserRole.COMPANY_MANAGER && task.project.company_id === user.company_id);
    if (!can) throw new AuthorizationError('작업 수정 권한이 없습니다');

    // if assignee_id changes, ensure new assignee is in project allocation
    if (body.assignee_id && body.assignee_id !== task.assignee_id) {
      const alloc = await prisma.allocateProject.findFirst({ where: { project_id: task.project_id, user_id: body.assignee_id } });
      if (!alloc) throw new AuthorizationError('새 담당자는 프로젝트 팀원이어야 합니다');
    }

    const upd = await prisma.task.update({
      where: { id: taskId },
      data: {
        task_name: body.task_name ?? undefined,
        task_description: body.task_description ?? undefined,
        end_date: body.end_date ? new Date(body.end_date) : undefined,
        progress_rate: body.progress_rate !== undefined ? new Prisma.Decimal(body.progress_rate) : undefined,
        assignee_id: body.assignee_id ?? undefined,
        updated_at: new Date(),
      },
      include: { status: true, assignee: true },
    });

    return {
      id: upd.id,
      task_name: upd.task_name,
      task_description: upd.task_description,
      project_id: upd.project_id,
      assignee_id: upd.assignee_id,
      assignee_name: upd.assignee?.user_name || null,
      start_date: upd.start_date ? upd.start_date.toISOString().slice(0, 10) : null,
      end_date: upd.end_date ? upd.end_date.toISOString().slice(0, 10) : null,
      progress_rate: Number(upd.progress_rate || 0),
      status_id: upd.status_id || null,
      updated_at: upd.updated_at.toISOString(),
    };
  }
}
