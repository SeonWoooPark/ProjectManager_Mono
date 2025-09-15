import { PrismaClient } from '@prisma/client';

export interface FindOptions {
  where?: any;
  include?: any;
  orderBy?: any;
  skip?: number;
  take?: number;
  select?: any;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export abstract class BaseRepository<T> {
  protected prisma: PrismaClient;
  protected model: any;

  constructor(prisma: PrismaClient, modelName: string) {
    this.prisma = prisma;
    this.model = (prisma as any)[modelName];
  }

  async findById(id: string, options?: FindOptions): Promise<T | null> {
    return this.model.findUnique({
      where: { id },
      include: options?.include,
      select: options?.select,
    });
  }

  async findOne(options: FindOptions): Promise<T | null> {
    return this.model.findFirst({
      where: options.where,
      include: options.include,
      orderBy: options.orderBy,
      select: options.select,
    });
  }

  async findAll(options?: FindOptions): Promise<T[]> {
    return this.model.findMany({
      where: options?.where,
      include: options?.include,
      orderBy: options?.orderBy,
      skip: options?.skip,
      take: options?.take,
      select: options?.select,
    });
  }

  async create(data: any, options?: { include?: any; select?: any }): Promise<T> {
    return this.model.create({
      data,
      include: options?.include,
      select: options?.select,
    });
  }

  async update(id: string, data: any, options?: { include?: any; select?: any }): Promise<T> {
    return this.model.update({
      where: { id },
      data,
      include: options?.include,
      select: options?.select,
    });
  }

  async updateMany(where: any, data: any): Promise<{ count: number }> {
    return this.model.updateMany({
      where,
      data,
    });
  }

  async delete(id: string): Promise<T> {
    return this.model.delete({
      where: { id },
    });
  }

  async deleteMany(where: any): Promise<{ count: number }> {
    return this.model.deleteMany({
      where,
    });
  }

  async count(where?: any): Promise<number> {
    return this.model.count({
      where,
    });
  }

  async exists(where: any): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }

  async paginate(
    options: FindOptions & PaginationOptions
  ): Promise<PaginationResult<T>> {
    const { page = 1, limit = 10, where, include, orderBy, select } = options;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.findAll({
        where,
        include,
        orderBy,
        skip,
        take: limit,
        select,
      }),
      this.count(where),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  // Transaction helper
  async transaction<R>(fn: (tx: any) => Promise<R>): Promise<R> {
    return this.prisma.$transaction(fn);
  }

  // Raw query execution
  async raw<R = any>(query: string, params?: any[]): Promise<R> {
    return this.prisma.$queryRawUnsafe(query, ...(params || []));
  }
}