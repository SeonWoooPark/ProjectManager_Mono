-- CreateTable
CREATE TABLE "pm"."activity_logs" (
    "id" VARCHAR(50) NOT NULL,
    "task_id" VARCHAR(50),
    "project_id" VARCHAR(50),
    "changed_by" VARCHAR(50) NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "details" JSONB,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm"."allocate_projects" (
    "id" VARCHAR(50) NOT NULL,
    "user_id" VARCHAR(50) NOT NULL,
    "project_id" VARCHAR(50) NOT NULL,
    "allocated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "allocate_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm"."companies" (
    "id" VARCHAR(50) NOT NULL,
    "company_name" VARCHAR(200) NOT NULL,
    "company_description" VARCHAR(1000),
    "manager_id" VARCHAR(50),
    "invitation_code" VARCHAR(20),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status_id" INTEGER NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm"."companies_status" (
    "id" INTEGER NOT NULL,
    "status_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "companies_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm"."password_reset_tokens" (
    "id" VARCHAR(50) NOT NULL,
    "user_id" VARCHAR(50) NOT NULL,
    "jti" VARCHAR(100) NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used_at" TIMESTAMP(6),

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm"."project_status" (
    "id" INTEGER NOT NULL,
    "status_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "project_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm"."projects" (
    "id" VARCHAR(50) NOT NULL,
    "project_name" VARCHAR(200) NOT NULL,
    "project_description" VARCHAR(2000),
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "company_id" VARCHAR(50) NOT NULL,
    "progress_rate" DECIMAL(5,2) DEFAULT 0,
    "status_id" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm"."refresh_tokens" (
    "id" VARCHAR(50) NOT NULL,
    "user_id" VARCHAR(50) NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "token_family" VARCHAR(100) NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMP(6),
    "revoked_at" TIMESTAMP(6),
    "revoked_reason" VARCHAR(50),
    "user_agent" VARCHAR(500),
    "device_fingerprint" VARCHAR(255),

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm"."reviews" (
    "id" VARCHAR(50) NOT NULL,
    "task_id" VARCHAR(50) NOT NULL,
    "status_id" INTEGER,
    "assignee_id" VARCHAR(50) NOT NULL,
    "manager_id" VARCHAR(50) NOT NULL,
    "comment" VARCHAR(1000),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(6),

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm"."roles" (
    "id" INTEGER NOT NULL,
    "role_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm"."tasks" (
    "id" VARCHAR(50) NOT NULL,
    "task_name" VARCHAR(200) NOT NULL,
    "task_description" VARCHAR(2000),
    "project_id" VARCHAR(50) NOT NULL,
    "assignee_id" VARCHAR(50),
    "status_id" INTEGER,
    "start_date" DATE,
    "end_date" DATE,
    "progress_rate" DECIMAL(5,2) DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm"."tasks_status" (
    "id" INTEGER NOT NULL,
    "status_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "tasks_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm"."token_blacklist" (
    "id" VARCHAR(50) NOT NULL,
    "jti" VARCHAR(100) NOT NULL,
    "token_type" VARCHAR(20) NOT NULL,
    "user_id" VARCHAR(50),
    "expires_at" TIMESTAMP(6) NOT NULL,
    "blacklisted_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" VARCHAR(100),

    CONSTRAINT "token_blacklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm"."users" (
    "id" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "user_name" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(20),
    "role_id" INTEGER NOT NULL,
    "status_id" INTEGER NOT NULL,
    "company_id" VARCHAR(50),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm"."users_status" (
    "id" INTEGER NOT NULL,
    "status_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "users_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_logs_action" ON "pm"."activity_logs"("action");

-- CreateIndex
CREATE INDEX "idx_logs_changed_by" ON "pm"."activity_logs"("changed_by");

-- CreateIndex
CREATE INDEX "idx_logs_created_at" ON "pm"."activity_logs"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_logs_project_id" ON "pm"."activity_logs"("project_id");

-- CreateIndex
CREATE INDEX "idx_logs_task_id" ON "pm"."activity_logs"("task_id");

-- CreateIndex
CREATE INDEX "idx_allocate_project_id" ON "pm"."allocate_projects"("project_id");

-- CreateIndex
CREATE INDEX "idx_allocate_user_id" ON "pm"."allocate_projects"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_user_project" ON "pm"."allocate_projects"("user_id", "project_id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_manager_id_key" ON "pm"."companies"("manager_id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_invitation_code_key" ON "pm"."companies"("invitation_code");

-- CreateIndex
CREATE INDEX "idx_companies_invitation_code" ON "pm"."companies"("invitation_code");

-- CreateIndex
CREATE INDEX "idx_companies_manager_id" ON "pm"."companies"("manager_id");

-- CreateIndex
CREATE INDEX "idx_companies_status" ON "pm"."companies"("status_id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_status_status_name_key" ON "pm"."companies_status"("status_name");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_jti_key" ON "pm"."password_reset_tokens"("jti");

-- CreateIndex
CREATE INDEX "idx_reset_expires_at" ON "pm"."password_reset_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "idx_reset_jti" ON "pm"."password_reset_tokens"("jti");

-- CreateIndex
CREATE INDEX "idx_reset_user_id" ON "pm"."password_reset_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_status_status_name_key" ON "pm"."project_status"("status_name");

-- CreateIndex
CREATE INDEX "idx_projects_company_id" ON "pm"."projects"("company_id");

-- CreateIndex
CREATE INDEX "idx_projects_dates" ON "pm"."projects"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "idx_projects_status_id" ON "pm"."projects"("status_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "pm"."refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "idx_refresh_expires_at" ON "pm"."refresh_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "idx_refresh_revoked_at" ON "pm"."refresh_tokens"("revoked_at");

-- CreateIndex
CREATE INDEX "idx_refresh_token_family" ON "pm"."refresh_tokens"("token_family");

-- CreateIndex
CREATE INDEX "idx_refresh_user_id" ON "pm"."refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "idx_reviews_manager_id" ON "pm"."reviews"("manager_id");

-- CreateIndex
CREATE INDEX "idx_reviews_status_id" ON "pm"."reviews"("status_id");

-- CreateIndex
CREATE INDEX "idx_reviews_task_id" ON "pm"."reviews"("task_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_name_key" ON "pm"."roles"("role_name");

-- CreateIndex
CREATE INDEX "idx_tasks_assignee_id" ON "pm"."tasks"("assignee_id");

-- CreateIndex
CREATE INDEX "idx_tasks_dates" ON "pm"."tasks"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "idx_tasks_project_id" ON "pm"."tasks"("project_id");

-- CreateIndex
CREATE INDEX "idx_tasks_status_id" ON "pm"."tasks"("status_id");

-- CreateIndex
CREATE UNIQUE INDEX "tasks_status_status_name_key" ON "pm"."tasks_status"("status_name");

-- CreateIndex
CREATE UNIQUE INDEX "token_blacklist_jti_key" ON "pm"."token_blacklist"("jti");

-- CreateIndex
CREATE INDEX "idx_blacklist_expires_at" ON "pm"."token_blacklist"("expires_at");

-- CreateIndex
CREATE INDEX "idx_blacklist_jti" ON "pm"."token_blacklist"("jti");

-- CreateIndex
CREATE INDEX "idx_blacklist_user_id" ON "pm"."token_blacklist"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "pm"."users"("email");

-- CreateIndex
CREATE INDEX "idx_users_company_id" ON "pm"."users"("company_id");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "pm"."users"("email");

-- CreateIndex
CREATE INDEX "idx_users_role_id" ON "pm"."users"("role_id");

-- CreateIndex
CREATE INDEX "idx_users_status_id" ON "pm"."users"("status_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_status_status_name_key" ON "pm"."users_status"("status_name");

-- AddForeignKey
ALTER TABLE "pm"."activity_logs" ADD CONSTRAINT "fk_logs_changed_by" FOREIGN KEY ("changed_by") REFERENCES "pm"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pm"."activity_logs" ADD CONSTRAINT "fk_logs_project" FOREIGN KEY ("project_id") REFERENCES "pm"."projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pm"."activity_logs" ADD CONSTRAINT "fk_logs_task" FOREIGN KEY ("task_id") REFERENCES "pm"."tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pm"."allocate_projects" ADD CONSTRAINT "fk_allocate_project" FOREIGN KEY ("project_id") REFERENCES "pm"."projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pm"."allocate_projects" ADD CONSTRAINT "fk_allocate_user" FOREIGN KEY ("user_id") REFERENCES "pm"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pm"."companies" ADD CONSTRAINT "fk_companies_manager" FOREIGN KEY ("manager_id") REFERENCES "pm"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pm"."companies" ADD CONSTRAINT "fk_companies_status" FOREIGN KEY ("status_id") REFERENCES "pm"."companies_status"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pm"."password_reset_tokens" ADD CONSTRAINT "fk_reset_user" FOREIGN KEY ("user_id") REFERENCES "pm"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pm"."projects" ADD CONSTRAINT "fk_projects_company" FOREIGN KEY ("company_id") REFERENCES "pm"."companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pm"."projects" ADD CONSTRAINT "fk_projects_status" FOREIGN KEY ("status_id") REFERENCES "pm"."project_status"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pm"."refresh_tokens" ADD CONSTRAINT "fk_refresh_user" FOREIGN KEY ("user_id") REFERENCES "pm"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pm"."reviews" ADD CONSTRAINT "fk_reviews_assignee" FOREIGN KEY ("assignee_id") REFERENCES "pm"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pm"."reviews" ADD CONSTRAINT "fk_reviews_manager" FOREIGN KEY ("manager_id") REFERENCES "pm"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pm"."reviews" ADD CONSTRAINT "fk_reviews_status" FOREIGN KEY ("status_id") REFERENCES "pm"."tasks_status"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pm"."reviews" ADD CONSTRAINT "fk_reviews_task" FOREIGN KEY ("task_id") REFERENCES "pm"."tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pm"."tasks" ADD CONSTRAINT "fk_tasks_assignee" FOREIGN KEY ("assignee_id") REFERENCES "pm"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pm"."tasks" ADD CONSTRAINT "fk_tasks_project" FOREIGN KEY ("project_id") REFERENCES "pm"."projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pm"."tasks" ADD CONSTRAINT "fk_tasks_status" FOREIGN KEY ("status_id") REFERENCES "pm"."tasks_status"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pm"."token_blacklist" ADD CONSTRAINT "fk_blacklist_user" FOREIGN KEY ("user_id") REFERENCES "pm"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pm"."users" ADD CONSTRAINT "fk_users_company" FOREIGN KEY ("company_id") REFERENCES "pm"."companies"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pm"."users" ADD CONSTRAINT "fk_users_role" FOREIGN KEY ("role_id") REFERENCES "pm"."roles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pm"."users" ADD CONSTRAINT "fk_users_status" FOREIGN KEY ("status_id") REFERENCES "pm"."users_status"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
