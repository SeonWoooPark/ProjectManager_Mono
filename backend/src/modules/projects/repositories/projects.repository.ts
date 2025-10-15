import { prisma } from '@infrastructure/database/prisma.service';
import { Prisma } from '@prisma/client';
import { AuthorizationError, ConflictError, NotFoundError } from '@shared/utils/errors';
import { UserRole } from '@modules/auth/interfaces/auth.types';
import { injectable } from 'tsyringe';

@injectable()
export class ProjectsRepository {
  constructor() {}

  async createProject(
    companyId: string,
    _creatorId: string,
    data: {
      project_name: string;
      project_description: string | null;
      start_date: Date;
      end_date: Date;
      member_ids: string[];
    }
  ) {
    const projectId = require('crypto').randomBytes(6).toString('hex');
    const prjId = `prj_${projectId}`;

    const result = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          id: prjId,
          project_name: data.project_name,
          project_description: data.project_description,
          start_date: data.start_date,
          end_date: data.end_date,
          company_id: companyId,
          progress_rate: new Prisma.Decimal(0),
          status_id: 1,
        },
        include: { status: true },
      });

      if (data.member_ids && data.member_ids.length > 0) {
        await tx.allocateProject.createMany({
          data: data.member_ids.map((uid) => ({
            id: `alc_${require('crypto').randomBytes(6).toString('hex')}`,
            user_id: uid,
            project_id: project.id,
          })),
          skipDuplicates: true,
        });
      }

      // Load allocated members for response (id, user_name, role_name)
      const members = await tx.allocateProject.findMany({
        where: { project_id: project.id },
        include: { user: { include: { role: true } } },
      });

      return {
        id: project.id,
        project_name: project.project_name,
        project_description: project.project_description,
        start_date: project.start_date.toISOString().slice(0, 10),
        end_date: project.end_date.toISOString().slice(0, 10),
        company_id: project.company_id,
        progress_rate: Number(project.progress_rate || 0),
        status_id: project.status_id || 1,
        status_name: project.status?.status_name || '준비중',
        created_at: project.created_at.toISOString(),
        allocated_members: members.map((m) => ({
          user_id: m.user_id,
          user_name: m.user.user_name,
          role_name: m.user.role.role_name,
        })),
      };
    });

    return result;
  }

  async listProjects(
    user: { id: string; role_id: number; company_id: string | null },
    args: { page: number; limit: number; status_id?: number }
  ) {
    const where: any = {};
    if (user.role_id !== UserRole.SYSTEM_ADMIN) {
      if (!user.company_id) throw new AuthorizationError('회사 식별 불가');
      where.company_id = user.company_id;
    }
    if (args.status_id) where.status_id = args.status_id;

    const [total, rows] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        include: {
          status: true,
          tasks: { 
            include: { status: true }
          },
          allocatedProjects: { 
            include: { user: true }
          },
        },
        orderBy: { created_at: 'desc' },
        skip: (args.page - 1) * args.limit,
        take: args.limit,
      }),
    ]);

    const projects = await Promise.all(
      rows.map(async (p) => {
        const totalTasks = p.tasks.length;
        const completedTasks = p.tasks.filter((t: any) => t.status?.status_name === 'DONE').length;
        const incompleteTasks = totalTasks - completedTasks;

        const members = p.allocatedProjects.map((ap: any) => ({
          user_id: ap.user_id,
          user_name: ap.user.user_name,
          email: ap.user.email,
        }));

        return {
          id: p.id,
          project_name: p.project_name,
          project_description: p.project_description,
          start_date: p.start_date.toISOString().slice(0, 10),
          end_date: p.end_date.toISOString().slice(0, 10),
          progress_rate: Number(p.progress_rate || 0),
          status_id: p.status_id || 1,
          status_name: p.status?.status_name || null,
          completed_tasks: completedTasks,
          incomplete_tasks: incompleteTasks,
          total_tasks: totalTasks,
          allocated_members: members,
        };
      })
    );

    return {
      projects,
      total,
      page: args.page,
      limit: args.limit,
      total_pages: Math.max(1, Math.ceil(total / args.limit)),
      pagination: {
        total,
        page: args.page,
        limit: args.limit,
        total_pages: Math.max(1, Math.ceil(total / args.limit)),
      },
    };
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

  async getProjectDetail(user: { id: string; role_id: number; company_id: string | null }, projectId: string) {
    await this.assertProjectAccess(user, projectId);

    const p = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        status: true,
        allocatedProjects: { include: { user: { include: { role: true, status: true } } } },
        tasks: { include: { status: true } },
      },
    });
    if (!p) return null;

    // statistics by status_name
    const statMap: Record<string, number> = {};
    for (const t of p.tasks) {
      const name = t.status?.status_name || 'Unknown';
      statMap[name] = (statMap[name] || 0) + 1;
    }

    const statistics = {
      total_tasks: p.tasks.length,
      completed_tasks: statMap['DONE'] || 0,
      in_progress_tasks: statMap['IN_PROGRESS'] || 0,
      todo_tasks: statMap['TODO'] || 0,
      review_tasks: statMap['IN_REVIEW'] || 0,
      cancelled_tasks: statMap['CANCELLED'] || 0,
    };

    const projectData = {
      id: p.id,
      project_name: p.project_name,
      project_description: p.project_description,
      start_date: p.start_date.toISOString().slice(0, 10),
      end_date: p.end_date.toISOString().slice(0, 10),
      company_id: p.company_id,
      progress_rate: Number(p.progress_rate || 0),
      status_id: p.status_id || 1,
      status_name: p.status?.status_name || null,
      created_at: p.created_at.toISOString(),
      updated_at: p.updated_at.toISOString(),
      statistics,
      allocated_members: p.allocatedProjects.map((ap) => ({
        user_id: ap.user_id,
        user_name: ap.user.user_name,
        email: ap.user.email,
        role_name: ap.user.role.role_name,
        allocated_at: ap.allocated_at.toISOString(),
      })),
    };

    return {
      project: projectData,
      ...projectData // 하위 호환성을 위해 직접 필드도 유지
    };
  }

  async getProjectTasks(
    user: { id: string; role_id: number; company_id: string | null },
    projectId: string,
    filters: { status_id?: number; assignee_id?: string }
  ) {
    await this.assertProjectAccess(user, projectId);

    const tasks = await prisma.task.findMany({
      where: {
        project_id: projectId,
        ...(filters.status_id ? { status_id: filters.status_id } : {}),
        ...(filters.assignee_id ? { assignee_id: filters.assignee_id } : {}),
      },
      include: { status: true, assignee: true },
      orderBy: { created_at: 'desc' },
    });

    return {
      project_id: projectId,
      tasks: tasks.map((t) => ({
        id: t.id,
        task_name: t.task_name,
        task_description: t.task_description,
        assignee_id: t.assignee_id,
        assignee_name: t.assignee?.user_name || null,
        status_id: t.status_id || null,
        status_name: t.status?.status_name || null,
        start_date: t.start_date ? t.start_date.toISOString().slice(0, 10) : null,
        end_date: t.end_date ? t.end_date.toISOString().slice(0, 10) : null,
        progress_rate: Number(t.progress_rate || 0),
        created_at: t.created_at.toISOString(),
        updated_at: t.updated_at.toISOString(),
      })),
      total: tasks.length,
    };
  }

  async assertProjectEndDateValid(projectId: string, newEndDate: Date) {
    const project = await prisma.project.findUnique({ where: { id: projectId }, select: { start_date: true } });
    if (!project) throw new NotFoundError('프로젝트를 찾을 수 없습니다', 'project');
    if (newEndDate <= project.start_date) {
      throw new ConflictError('종료일은 시작일 이후여야 합니다', 'end_date');
    }
  }

  async updateProject(
    user: { id: string; role_id: number; company_id: string | null },
    projectId: string,
    body: any
  ) {
    await this.assertProjectAccess(user, projectId);

    const updated = await prisma.$transaction(async (tx) => {
      const upd = await tx.project.update({
        where: { id: projectId },
        data: {
          project_name: body.project_name ?? undefined,
          project_description: body.project_description ?? undefined,
          end_date: body.end_date ? new Date(body.end_date) : undefined,
          status_id: body.status_id ?? undefined,
          progress_rate: body.progress_rate !== undefined ? new Prisma.Decimal(body.progress_rate) : undefined,
          updated_at: new Date(),
        },
      });

      const members_added: string[] = [];
      const members_removed: string[] = [];

      if (Array.isArray(body.member_ids_to_add) && body.member_ids_to_add.length > 0) {
        const rows = body.member_ids_to_add.map((uid: string) => ({
          id: `alc_${require('crypto').randomBytes(6).toString('hex')}`,
          user_id: uid,
          project_id: projectId,
        }));
        await tx.allocateProject.createMany({ data: rows, skipDuplicates: true });
        members_added.push(...body.member_ids_to_add);
      }

      if (Array.isArray(body.member_ids_to_remove) && body.member_ids_to_remove.length > 0) {
        await tx.allocateProject.deleteMany({
          where: { project_id: projectId, user_id: { in: body.member_ids_to_remove } },
        });
        members_removed.push(...body.member_ids_to_remove);
      }

      return {
        id: upd.id,
        project_name: upd.project_name,
        project_description: upd.project_description,
        start_date: upd.start_date.toISOString().slice(0, 10),
        end_date: upd.end_date.toISOString().slice(0, 10),
        status_id: upd.status_id || null,
        progress_rate: Number(upd.progress_rate || 0),
        updated_at: upd.updated_at.toISOString(),
        members_added,
        members_removed,
      };
    });

    return updated;
  }

  async createTaskInProject(
    user: { id: string; role_id: number; company_id: string | null },
    projectId: string,
    data: { task_name: string; task_description: string | null; assignee_id: string; start_date: Date; end_date: Date }
  ) {
    await this.assertProjectAccess(user, projectId);

    // check assignee belongs to project allocation
    const alloc = await prisma.allocateProject.findFirst({
      where: { project_id: projectId, user_id: data.assignee_id },
    });
    if (!alloc) throw new AuthorizationError('담당자는 프로젝트에 할당된 사용자여야 합니다');

    // create task
    const taskId = `tsk_${require('crypto').randomBytes(6).toString('hex')}`;
    const task = await prisma.task.create({
      data: {
        id: taskId,
        task_name: data.task_name,
        task_description: data.task_description,
        project_id: projectId,
        assignee_id: data.assignee_id,
        status_id: 1,
        start_date: data.start_date,
        end_date: data.end_date,
        progress_rate: new Prisma.Decimal(0),
      },
      include: { status: true, assignee: true },
    });

    return {
      id: task.id,
      task_name: task.task_name,
      task_description: task.task_description,
      project_id: task.project_id,
      assignee_id: task.assignee_id,
      assignee_name: task.assignee?.user_name || null,
      status_id: task.status_id || 1,
      status_name: task.status?.status_name || 'Todo',
      start_date: task.start_date ? task.start_date.toISOString().slice(0, 10) : null,
      end_date: task.end_date ? task.end_date.toISOString().slice(0, 10) : null,
      progress_rate: Number(task.progress_rate || 0),
      created_at: task.created_at.toISOString(),
    };
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
      total: enriched.length,
      total_members: enriched.length,
    };
  }

  async deleteProject(
    user: { id: string; role_id: number; company_id: string | null },
    projectId: string
  ) {
    // 1. 프로젝트 접근 권한 확인 (기존 메서드 활용)
    await this.assertProjectAccess(user, projectId);

    // 2. Hard Delete 수행
    // Prisma Cascade로 자동 삭제:
    // - allocate_projects
    // - tasks (및 하위 reviews)
    // - activity_logs
    await prisma.project.delete({
      where: { id: projectId }
    });
  }
}
