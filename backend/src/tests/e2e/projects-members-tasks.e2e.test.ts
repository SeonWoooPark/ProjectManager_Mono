import 'reflect-metadata';
import { Application } from 'express';
import { createTestApp } from '../helpers/test-app';
import { createTestHelper, TestHelper } from '../helpers/test-helper';

describe('Projects, Members, Tasks API E2E Tests - 통합 테스트', () => {
  let app: Application;
  let testHelper: TestHelper;

  // 테스트에서 사용할 변수들
  let systemAdminToken: string;
  let companyManagerToken: string;
  let teamMemberToken: string;
  let companyId: string;
  let managerId: string;
  let memberId: string;
  let invitationCode: string;
  let projectId: string;
  let taskId: string;

  beforeAll(async () => {
    // 테스트용 Express 앱 생성
    app = await createTestApp();
    testHelper = createTestHelper(app);

    // 데이터베이스 초기화
    await testHelper.cleanDatabase();

    // ===== 기본 데이터 설정 (인증 플로우) =====
    // 시스템 관리자 생성
    await testHelper.createSystemAdmin();
    const adminLogin = await testHelper.login('admin@system.com', 'Admin123!@#');
    systemAdminToken = adminLogin.accessToken;

    // 회사 관리자 회원가입 및 승인
    const { company, manager } = await testHelper.signupCompanyManager(
      '테스트회사',
      'manager@test.com',
      'Manager123!@#'
    );
    companyId = company.id;
    managerId = manager.id;

    const approvalResult = await testHelper.approveCompanyByAdmin(systemAdminToken, companyId, true);
    invitationCode = approvalResult.invitationCode;

    // 회사 관리자 로그인
    const managerLogin = await testHelper.login('manager@test.com', 'Manager123!@#');
    companyManagerToken = managerLogin.accessToken;

    // 팀원 회원가입 및 승인
    const member = await testHelper.signupTeamMember(
      invitationCode,
      'member@test.com',
      'Member123!@#'
    );
    memberId = member.id;

    await testHelper.approveMemberByManager(companyManagerToken, memberId);

    // 팀원 로그인
    const memberLogin = await testHelper.login('member@test.com', 'Member123!@#');
    teamMemberToken = memberLogin.accessToken;
  });

  afterAll(async () => {
    await testHelper.cleanDatabase();
  });

  describe('1. Members API 테스트', () => {
    describe('1-1. 회사 전체 팀원 조회', () => {
      it('회사 관리자가 전체 팀원 목록을 조회할 수 있어야 함', async () => {
        const members = await testHelper.getMembers(companyManagerToken);

        expect(members).toBeDefined();
        expect(members.members).toBeInstanceOf(Array);
        expect(members.total).toBeGreaterThanOrEqual(2); // 관리자 + 팀원

        // 팀원 정보 확인
        const memberEmails = members.members.map((m: any) => m.email);
        expect(memberEmails).toContain('manager@test.com');
        expect(memberEmails).toContain('member@test.com');
      });

      it('팀원도 전체 팀원 목록을 조회할 수 있어야 함', async () => {
        const members = await testHelper.getMembers(teamMemberToken);

        expect(members).toBeDefined();
        expect(members.members).toBeInstanceOf(Array);
        expect(members.total).toBeGreaterThanOrEqual(2);
      });

      it('status_id 필터링이 가능해야 함', async () => {
        // ACTIVE(1) 상태의 팀원만 조회
        const activeMembers = await testHelper.getMembers(companyManagerToken, 1);

        expect(activeMembers).toBeDefined();
        expect(activeMembers.members).toBeInstanceOf(Array);

        // 모든 팀원이 ACTIVE 상태여야 함
        activeMembers.members.forEach((member: any) => {
          expect(member.status_id).toBe(1);
        });
      });

      it('role_id 필터링이 가능해야 함', async () => {
        // TEAM_MEMBER(3) 역할만 조회
        const teamMembers = await testHelper.getMembers(companyManagerToken, undefined, 3);

        expect(teamMembers).toBeDefined();
        expect(teamMembers.members).toBeInstanceOf(Array);

        // 모든 결과가 TEAM_MEMBER 역할이어야 함
        teamMembers.members.forEach((member: any) => {
          expect(member.role_id).toBe(3);
        });
      });
    });

    describe('1-2. 가입 요청한 팀원들 조회', () => {
      beforeAll(async () => {
        // 대기 중인 팀원 추가
        await testHelper.signupTeamMember(
          invitationCode,
          'pending@test.com',
          'Pending123!@#'
        );
      });

      it('회사 관리자가 대기 중인 팀원을 조회할 수 있어야 함', async () => {
        const pendingMembers = await testHelper.getPendingMembers(companyManagerToken);

        expect(pendingMembers).toBeDefined();
        expect(pendingMembers.pending_members).toBeInstanceOf(Array);
        expect(pendingMembers.total).toBeGreaterThanOrEqual(1);

        // 대기 중인 팀원 확인
        const pendingEmails = pendingMembers.pending_members.map((m: any) => m.email);
        expect(pendingEmails).toContain('pending@test.com');
      });

      it('일반 팀원은 대기 중인 팀원을 조회할 수 없어야 함', async () => {
        const response = await testHelper.getWithAuth('/api/v1/members/pending', teamMemberToken);

        console.log('Error Response:', JSON.stringify(response.body, null, 2));
        expect(response.status).toBe(403);
        expect(response.body.message).toContain('권한');
      });
    });
  });

  describe('2. Projects API 테스트', () => {
    describe('2-1. 프로젝트 생성', () => {
      it('회사 관리자가 프로젝트를 생성할 수 있어야 함', async () => {
        console.log('Manager ID:', managerId, 'Member ID:', memberId);
        const projectData = {
          project_name: 'E2E 테스트 프로젝트',
          project_description: 'E2E 테스트를 위한 프로젝트입니다',
          start_date: '2025-01-01',
          end_date: '2025-12-31',
          progress_rate: 0,
          status_id: 1, // 진행 중
          member_ids: [managerId, memberId] // 관리자와 팀원 할당
        };

        const project = await testHelper.createProject(companyManagerToken, projectData);

        expect(project).toBeDefined();
        expect(project).toBeDefined();
        expect(project.project_name).toBe('E2E 테스트 프로젝트');
        expect(project.status_id).toBe(1);

        projectId = project.id;
      });

      it('일반 팀원은 프로젝트를 생성할 수 없어야 함', async () => {
        const projectData = {
          project_name: '팀원 프로젝트',
          project_description: '팀원이 만든 프로젝트',
          start_date: '2025-01-01',
          end_date: '2025-12-31'
        };

        const response = await testHelper.postWithAuth('/api/v1/projects', teamMemberToken, projectData);

        expect(response.status).toBe(403);
        expect(response.body.message).toContain('권한');
      });

      it('종료일이 시작일보다 빠르면 생성 실패해야 함', async () => {
        const invalidProjectData = {
          project_name: '잘못된 프로젝트',
          project_description: '날짜가 잘못된 프로젝트',
          start_date: '2025-12-31',
          end_date: '2025-01-01' // 시작일보다 빠름
        };

        const response = await testHelper.postWithAuth('/api/v1/projects', companyManagerToken, invalidProjectData);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('종료일은 시작일보다 이후여야 합니다');
      });

      it('진행률이 0-100 범위를 벗어나면 생성 실패해야 함', async () => {
        const invalidProjectData = {
          project_name: '잘못된 프로젝트2',
          project_description: '진행률이 잘못된 프로젝트',
          start_date: '2025-01-01',
          end_date: '2025-12-31',
          progress_rate: 150 // 100 초과
        };

        const response = await testHelper.postWithAuth('/api/v1/projects', companyManagerToken, invalidProjectData);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('진행률');
      });
    });

    describe('2-2. 프로젝트 조회', () => {
      beforeAll(async () => {
        // 추가 프로젝트 생성
        await testHelper.createProject(companyManagerToken, {
          project_name: '두 번째 프로젝트',
          project_description: '추가 테스트 프로젝트',
          start_date: '2025-02-01',
          end_date: '2025-11-30',
          status_id: 2, // 대기
          member_ids: [managerId, memberId]
        });
      });

      it('회사 전체 프로젝트 목록을 조회할 수 있어야 함', async () => {
        const projects = await testHelper.getProjects(companyManagerToken);

        expect(projects).toBeDefined();
        expect(projects.projects).toBeInstanceOf(Array);
        expect(projects.pagination.total).toBeGreaterThanOrEqual(2);
        expect(projects.pagination).toBeDefined();
      });

      it('페이지네이션이 작동해야 함', async () => {
        const projects = await testHelper.getProjects(companyManagerToken, 1, 1);

        expect(projects.projects.length).toBeLessThanOrEqual(1);
        expect(projects.pagination.page).toBe(1);
        expect(projects.pagination.limit).toBe(1);
      });

      it('status_id로 필터링할 수 있어야 함', async () => {
        const activeProjects = await testHelper.getProjects(companyManagerToken, undefined, undefined, 1);

        expect(activeProjects.projects).toBeInstanceOf(Array);
        activeProjects.projects.forEach((project: any) => {
          expect(project.status_id).toBe(1);
        });
      });

      it('특정 프로젝트 상세 정보를 조회할 수 있어야 함', async () => {
        const projectDetail = await testHelper.getProjectDetail(companyManagerToken, projectId);

        expect(projectDetail).toBeDefined();
        expect(projectDetail).toBeDefined();
        expect(projectDetail.id).toBe(projectId);
        expect(projectDetail.project_name).toBe('E2E 테스트 프로젝트');
        expect(projectDetail.statistics).toBeDefined();
      });

      it('존재하지 않는 프로젝트 조회 시 404 에러가 발생해야 함', async () => {
        const response = await testHelper.getWithAuth('/api/v1/projects/prj_invalid123', companyManagerToken);

        expect(response.status).toBe(404);
        expect(response.body.message).toContain('찾을 수 없');
      });
    });

    describe('2-3. 프로젝트 수정', () => {
      it('회사 관리자가 프로젝트 정보를 수정할 수 있어야 함', async () => {
        const updateData = {
          project_name: '수정된 프로젝트',
          project_description: '수정된 설명입니다',
          progress_rate: 50
        };

        const updated = await testHelper.updateProject(companyManagerToken, projectId, updateData);

        expect(updated).toBeDefined();
        expect(updated.project_name).toBe('수정된 프로젝트');
        expect(updated.project_description).toBe('수정된 설명입니다');
        expect(updated.progress_rate).toBe(50);
      });

      it('일반 팀원은 프로젝트를 수정할 수 없어야 함', async () => {
        const updateData = {
          project_name: '팀원이 수정한 프로젝트'
        };

        const response = await testHelper.patchWithAuth(`/api/v1/projects/${projectId}`, teamMemberToken, updateData);

        expect(response.status).toBe(403);
        expect(response.body.message).toContain('권한');
      });

      it('종료일을 시작일보다 빠르게 수정하면 실패해야 함', async () => {
        const invalidUpdate = {
          start_date: '2025-03-01',
          end_date: '2025-02-01'
        };

        const response = await testHelper.patchWithAuth(
          `/api/v1/projects/${projectId}`,
          companyManagerToken,
          invalidUpdate
        );

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('종료일은 시작일보다 이후여야 합니다');
      });
    });

    describe('2-4. 프로젝트 참여 팀원 조회', () => {
      it('프로젝트에 참여 중인 팀원 목록을 조회할 수 있어야 함', async () => {
        const members = await testHelper.getProjectMembers(companyManagerToken, projectId);

        expect(members).toBeDefined();
        expect(members.members).toBeInstanceOf(Array);
        expect(members.total).toBeGreaterThanOrEqual(2); // 관리자 + 팀원

        // 팀원 정보 확인
        const memberIds = members.members.map((m: any) => m.id);
        expect(memberIds).toContain(managerId);
        expect(memberIds).toContain(memberId);
      });

      it('존재하지 않는 프로젝트의 팀원 조회 시 404 에러가 발생해야 함', async () => {
        const response = await testHelper.getWithAuth('/api/v1/projects/prj_invalid123/members', companyManagerToken);

        expect(response.status).toBe(404);
        expect(response.body.message).toContain('찾을 수 없');
      });
    });
  });

  describe('3. Tasks API 테스트', () => {
    describe('3-1. 작업 생성', () => {
      it('회사 관리자가 프로젝트에 작업을 생성할 수 있어야 함', async () => {
        const taskData = {
          task_name: 'E2E 테스트 작업',
          task_description: 'E2E 테스트를 위한 작업입니다',
          assignee_id: memberId,
          start_date: '2025-01-15',
          end_date: '2025-01-25',
          status_id: 1
        };

        const task = await testHelper.createTask(companyManagerToken, projectId, taskData);

        expect(task).toBeDefined();
        expect(task.task_name).toBe('E2E 테스트 작업');
        expect(task.assignee_id).toBe(memberId);
        expect(task.status_id).toBe(1);

        taskId = task.id;
      });

      it('일반 팀원은 작업을 생성할 수 없어야 함', async () => {
        const taskData = {
          task_name: '팀원 작업',
          task_description: '팀원이 만든 작업',
          assignee_id: memberId,
          start_date: '2025-01-15',
          end_date: '2025-01-25'
        };

        const response = await testHelper.postWithAuth(
          `/api/v1/projects/${projectId}/tasks`,
          teamMemberToken,
          taskData
        );

        expect(response.status).toBe(403);
        expect(response.body.message).toContain('권한');
      });

      it('종료일이 시작일보다 빠르면 작업 생성이 실패해야 함', async () => {
        const invalidTaskData = {
          task_name: '잘못된 작업',
          task_description: '날짜가 잘못된 작업',
          assignee_id: memberId,
          start_date: '2025-02-15',
          end_date: '2025-01-15'
        };

        const response = await testHelper.postWithAuth(
          `/api/v1/projects/${projectId}/tasks`,
          companyManagerToken,
          invalidTaskData
        );

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('종료일은 시작일보다 이후여야 합니다');
      });

      it('존재하지 않는 프로젝트에 작업 생성 시 404 에러가 발생해야 함', async () => {
        const taskData = {
          task_name: '존재하지 않는 프로젝트 작업',
          task_description: '존재하지 않는 프로젝트에 생성하려는 작업',
          assignee_id: memberId,
          start_date: '2025-01-15',
          end_date: '2025-01-25'
        };

        const response = await testHelper.postWithAuth(
          '/api/v1/projects/prj_invalid123/tasks',
          companyManagerToken,
          taskData
        );

        expect(response.status).toBe(404);
        expect(response.body.message).toContain('찾을 수 없');
      });
    });

    describe('3-2. 작업 조회', () => {
      it('할당된 작업 목록을 조회할 수 있어야 함', async () => {
        const assignedTasks = await testHelper.getAssignedTasks(teamMemberToken);

        expect(assignedTasks).toBeDefined();
        expect(assignedTasks.tasks).toBeInstanceOf(Array);
        expect(assignedTasks.total).toBeGreaterThanOrEqual(1);

        // 생성한 작업이 포함되어 있는지 확인
        const myTask = assignedTasks.tasks.find((t: any) => t.id === taskId);
        expect(myTask).toBeDefined();
        expect(myTask.assignee_id).toBe(memberId);
      });

      it('프로젝트의 작업 목록을 조회할 수 있어야 함', async () => {
        const projectTasks = await testHelper.getProjectTasks(companyManagerToken, projectId);

        expect(projectTasks).toBeDefined();
        expect(projectTasks.tasks).toBeInstanceOf(Array);
        expect(projectTasks.total).toBeGreaterThanOrEqual(1);

        // 생성한 작업이 포함되어 있는지 확인
        const task = projectTasks.tasks.find((t: any) => t.id === taskId);
        expect(task).toBeDefined();
      });

      it('status_id로 작업을 필터링할 수 있어야 함', async () => {
        const todoTasks = await testHelper.getProjectTasks(companyManagerToken, projectId, 1);

        expect(todoTasks.tasks).toBeInstanceOf(Array);
        todoTasks.tasks.forEach((task: any) => {
          expect(task.status_id).toBe(1);
        });
      });
    });

    describe('3-3. 작업 수정', () => {
      it('회사 관리자가 작업 정보를 수정할 수 있어야 함', async () => {
        const updateData = {
          task_name: '수정된 작업',
          task_description: '수정된 설명입니다',
          progress_rate: 30
        };

        const updated = await testHelper.updateTask(companyManagerToken, taskId, updateData);

        expect(updated).toBeDefined();
        expect(updated.task_name).toBe('수정된 작업');
        expect(updated.task_description).toBe('수정된 설명입니다');
        expect(updated.progress_rate).toBe(30);
      });

      it('일반 팀원은 작업을 수정할 수 없어야 함', async () => {
        // 먼저 관리자에게 할당된 작업을 생성
        const managerTaskData = {
          task_name: '관리자 전용 작업',
          task_description: '관리자에게만 할당된 작업',
          assignee_id: managerId, // 관리자에게 할당
          start_date: '2025-01-26',
          end_date: '2025-01-30',
          status_id: 1
        };

        const managerTask = await testHelper.createTask(companyManagerToken, projectId, managerTaskData);

        // 팀원이 관리자의 작업을 수정하려고 시도
        const updateData = {
          task_name: '팀원이 수정한 작업'
        };

        const response = await testHelper.patchWithAuth(
          `/api/v1/tasks/${managerTask.id}`,
          teamMemberToken,
          updateData
        );

        expect(response.status).toBe(403);
        expect(response.body.message).toContain('권한');
      });

      it('종료일을 시작일보다 빠르게 수정하면 실패해야 함', async () => {
        const invalidUpdate = {
          start_date: '2025-03-01',
          end_date: '2025-02-01'
        };

        const response = await testHelper.patchWithAuth(
          `/api/v1/tasks/${taskId}`,
          companyManagerToken,
          invalidUpdate
        );

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('종료일은 시작일보다 이후여야 합니다');
      });
    });

    describe('3-4. 작업 상태 변경', () => {
      it('작업 상태를 변경할 수 있어야 함', async () => {
        const updated = await testHelper.updateTaskStatus(companyManagerToken, taskId, 2); // 진행 중

        expect(updated).toBeDefined();
        expect(updated.status_id).toBe(2);
        expect(updated.new_status).toBeDefined();
      });

      it('할당된 팀원도 자신의 작업 상태를 변경할 수 있어야 함', async () => {
        // 먼저 작업을 팀원에게 다시 할당
        await testHelper.updateTask(companyManagerToken, taskId, { assignee_id: memberId });

        // 팀원이 상태 변경
        const updated = await testHelper.updateTaskStatus(teamMemberToken, taskId, 3); // 검토 중

        expect(updated.status_id).toBe(3);
      });

      it('유효하지 않은 상태 ID로 변경 시 실패해야 함', async () => {
        const response = await testHelper.patchWithAuth(
          `/api/v1/tasks/${taskId}/status`,
          companyManagerToken,
          { status_id: 10 } // 존재하지 않는 상태
        );

        expect(response.status).toBe(400);
        expect(response.body.message).toBeDefined();
      });

      it('존재하지 않는 작업의 상태 변경 시 404 에러가 발생해야 함', async () => {
        const response = await testHelper.patchWithAuth(
          '/api/v1/tasks/tsk_invalid123/status',
          companyManagerToken,
          { status_id: 2 }
        );

        expect(response.status).toBe(404);
        expect(response.body.message).toContain('찾을 수 없');
      });
    });
  });

  describe('4. 통합 시나리오 테스트', () => {
    let integrationProjectId: string;
    let integrationTaskId: string;

    describe('4-1. 프로젝트 생성부터 작업 완료까지의 전체 플로우', () => {
      it('프로젝트를 생성하고 팀원을 할당할 수 있어야 함', async () => {
        // 1. 프로젝트 생성
        const project = await testHelper.createProject(companyManagerToken, {
          project_name: '통합 테스트 프로젝트',
          project_description: '전체 플로우 테스트를 위한 프로젝트',
          start_date: '2025-01-01',
          end_date: '2025-06-30',
          member_ids: [managerId, memberId]
        });

        integrationProjectId = project.id;
        expect(integrationProjectId).toBeDefined();

        // 2. 프로젝트 팀원 확인
        const projectMembers = await testHelper.getProjectMembers(companyManagerToken, integrationProjectId);
        expect(projectMembers.members).toBeDefined();
      });

      it('프로젝트에 작업을 생성하고 할당할 수 있어야 함', async () => {
        // 1. 첫 번째 작업 생성 (팀원에게 할당)
        const task1 = await testHelper.createTask(companyManagerToken, integrationProjectId, {
          task_name: '설계 작업',
          task_description: '시스템 설계 문서 작성',
          assignee_id: memberId,
          start_date: '2025-01-10',
          end_date: '2025-01-20',
          
          status_id: 1
        });

        integrationTaskId = task1.id;

        // 2. 두 번째 작업 생성 (관리자에게 할당)
        await testHelper.createTask(companyManagerToken, integrationProjectId, {
          task_name: '검토 작업',
          task_description: '설계 문서 검토',
          assignee_id: managerId,
          start_date: '2025-01-21',
          end_date: '2025-01-25',
          
          status_id: 1
        });

        // 3. 프로젝트의 작업 목록 확인
        const projectTasks = await testHelper.getProjectTasks(companyManagerToken, integrationProjectId);
        expect(projectTasks.total).toBeGreaterThanOrEqual(2);
      });

      it('팀원이 할당된 작업을 진행하고 완료할 수 있어야 함', async () => {
        // 1. 팀원이 자신에게 할당된 작업 확인
        const assignedTasks = await testHelper.getAssignedTasks(teamMemberToken);
        const myTask = assignedTasks.tasks.find((t: any) => t.id === integrationTaskId);
        expect(myTask).toBeDefined();

        // 2. 작업 시작 (상태를 '진행 중'으로 변경)
        await testHelper.updateTaskStatus(teamMemberToken, integrationTaskId, 2);

        // 3. 작업 진행률 업데이트
        await testHelper.updateTask(teamMemberToken, integrationTaskId, {
          progress_rate: 50
        });

        // 4. 작업 완료
        await testHelper.updateTaskStatus(teamMemberToken, integrationTaskId, 4);

        // 5. 완료된 작업 확인
        const completedTasks = await testHelper.getProjectTasks(
          companyManagerToken,
          integrationProjectId,
          4 // 완료 상태
        );

        const completedTask = completedTasks.tasks.find((t: any) => t.id === integrationTaskId);
        expect(completedTask).toBeDefined();
        expect(completedTask.status_id).toBe(4);
      });

      it('프로젝트 전체 진행 상황을 파악할 수 있어야 함', async () => {
        // 1. 프로젝트 상세 정보 조회
        const projectDetail = await testHelper.getProjectDetail(companyManagerToken, integrationProjectId);

        expect(projectDetail).toBeDefined();
        expect(projectDetail.statistics).toBeDefined();
        expect(projectDetail.statistics.total_tasks).toBeDefined();

        // 2. 프로젝트 진행률 업데이트
        const totalTasks = projectDetail.statistics.total_tasks;
        const completedTasks = projectDetail.statistics.completed_tasks;
        const progressRate = Math.round((completedTasks / totalTasks) * 100);

        await testHelper.updateProject(companyManagerToken, integrationProjectId, {
          progress_rate: progressRate
        });

        // 3. 업데이트된 프로젝트 확인
        const updatedProject = await testHelper.getProjectDetail(companyManagerToken, integrationProjectId);
        expect(updatedProject.progress_rate).toBe(progressRate);
      });
    });

    describe('4-2. 권한 검증 종합 테스트', () => {
      it('시스템 관리자는 모든 리소스에 접근할 수 있어야 함', async () => {
        // 1. 모든 회사의 팀원 조회
        const allMembers = await testHelper.getMembers(systemAdminToken);
        expect(allMembers.members).toBeDefined();

        // 2. 모든 프로젝트 조회
        const allProjects = await testHelper.getProjects(systemAdminToken);
        expect(allProjects.projects).toBeDefined();

        // 3. 특정 프로젝트 상세 조회
        const projectDetail = await testHelper.getProjectDetail(systemAdminToken, projectId);
        expect(projectDetail.project).toBeDefined();
      });

      it('회사 관리자는 자신의 회사 리소스만 관리할 수 있어야 함', async () => {
        // 1. 자신의 회사 팀원 조회 (성공)
        const companyMembers = await testHelper.getMembers(companyManagerToken);
        expect(companyMembers.members).toBeDefined();

        // 2. 자신의 회사 프로젝트 생성 (성공)
        const newProject = await testHelper.createProject(companyManagerToken, {
          project_name: '권한 테스트 프로젝트',
          project_description: '회사 관리자 권한 테스트',
          start_date: '2025-03-01',
          end_date: '2025-09-30',
          member_ids: [managerId, memberId]
        });
        expect(newProject).toBeDefined();

        // 3. 대기 중인 팀원 조회 (성공)
        const pendingMembers = await testHelper.getPendingMembers(companyManagerToken);
        expect(pendingMembers).toBeDefined();
      });

      it('일반 팀원은 읽기 권한만 가지고 있어야 함', async () => {
        // 1. 팀원 목록 조회 (성공)
        const members = await testHelper.getMembers(teamMemberToken);
        expect(members.members).toBeDefined();

        // 2. 프로젝트 목록 조회 (성공)
        const projects = await testHelper.getProjects(teamMemberToken);
        expect(projects.projects).toBeDefined();

        // 3. 자신에게 할당된 작업 조회 (성공)
        const myTasks = await testHelper.getAssignedTasks(teamMemberToken);
        expect(myTasks.tasks).toBeDefined();

        // 4. 프로젝트 생성 시도 (실패)
        const response = await testHelper.postWithAuth('/api/v1/projects', teamMemberToken, {
          project_name: '권한 없는 프로젝트',
          project_description: '생성 불가',
          start_date: '2025-01-01',
          end_date: '2025-12-31'
        });
        expect(response.status).toBe(403);

        // 5. 대기 중인 팀원 조회 시도 (실패)
        const pendingResponse = await testHelper.getWithAuth('/api/v1/members/pending', teamMemberToken);
        expect(pendingResponse.status).toBe(403);
      });
    });
  });
});