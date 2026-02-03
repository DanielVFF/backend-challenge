import { Injectable, Logger } from '@nestjs/common';
import {
  Prisma,
  PrismaClient,
  ProviderEnum,
  User,
  UserAccess,
  MethodEnum,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto } from 'src/core/interfaces/request/dto/pagination-query.dto';
import { ListUserFilterDto } from './dto/list-user-filter.dto';
import { DEFAULT_ITEMS_PER_PAGE } from 'src/core/helper/interface/helper.types';
import { userDtoFactory } from './dto/user.dto';
import { UserProviderDto } from './dto/provider.dto/user-provider.dto';
import { updateUserDtoFactory } from './dto/update-user.dto';

@Injectable()
export class UserRepository {
  private readonly logger = new Logger(UserRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Search for an active user by filter
   */
  async getUserByFilter(
    where: Prisma.UserWhereInput,
    client?: PrismaClient,
  ): Promise<User | null> {
    try {
      const prismaClient = client || this.prisma;

      const user = await prismaClient.user.findFirst({
        where: {
          ...where,
          deleted_at: null,
        },
      });

      return user;
    } catch (error) {
      this.logger.error('Erro ao buscar usuário por email:', error);
      throw error;
    }
  }

  async upsertProvider(data: UserProviderDto): Promise<void> {
    const existing = await this.prisma.userProvider.findFirst({
      where: {
        user_id: data.user_id,
        provider: data.provider as ProviderEnum,
      },
    });

    if (existing) {
      await this.prisma.userProvider.update({
        where: { id: existing.id },
        data: {
          provider_id: data.provider_id,
        },
      });
    } else {
      await this.prisma.userProvider.create({
        data: {
          user_id: data.user_id,
          provider: data.provider as ProviderEnum,
          provider_id: data.provider_id,
        },
      });
    }
  }

  /**
   * Retorna todos os usuários cadastrados.
   */
  async getAllUsers(
    query: PaginationQueryDto,
    filter: ListUserFilterDto,
    client?: PrismaClient,
  ): Promise<User[]> {
    const prismaClient = client || this.prisma;

    const users = await prismaClient.user.findMany({
      where: {
        deleted_at: null,
        ...Object.entries(filter).reduce((acc, [key, value]) => {
          if (!value) return acc;
          const map: Record<string, string> = {
            name: 'name',
            email: 'email',
            cpf: 'document',
          };
          if (map[key]) {
            acc[map[key]] = { contains: value, mode: 'insensitive' };
          }
          return acc;
        }, {}),
      },
      orderBy: { created_at: 'desc' },
      skip: ((query?.page ?? 1) - 1) * (query?.limit ?? DEFAULT_ITEMS_PER_PAGE),
      take: query?.limit ?? DEFAULT_ITEMS_PER_PAGE,
    });
    return users;
  }

  async countTotalUsers(
    filter: ListUserFilterDto,
    client?: PrismaClient,
  ): Promise<number> {
    const prismaClient = client || this.prisma;
    return await prismaClient.user.count({
      where: {
        deleted_at: null,
        ...Object.entries(filter).reduce((acc, [key, value]) => {
          if (!value) return acc;
          const map: Record<string, string> = {
            name: 'name',
            email: 'email',
          };
          if (map[key]) {
            acc[map[key]] = { contains: value };
          }
          return acc;
        }, {}),
      },
    });
  }

  /**
   * Cria um novo usuário.
   */
  async createUser(
    data: Prisma.UserCreateInput,
    client?: PrismaClient,
  ): Promise<User> {
    const prismaClient = client || this.prisma;

    const user = await prismaClient.user.create({
      data,
    });

    return user;
  }

  /**
   * Atualiza as informações de um usuário específico.
   */
  async updateUser(
    id: string,
    data: Prisma.UserUpdateInput,
    client?: PrismaClient,
  ): Promise<User> {
    const prismaClient = client || this.prisma;

    const updateData: Partial<{
      name: string;
      email: string;
      password: string;
      document: string;
    }> = updateUserDtoFactory({
      name: data.name as string,
      email: data.email as string,
      password: data.password as string,
    });

    const user = await prismaClient.user.update({
      where: { id },
      data: updateData,
    });

    return user;
  }

  /**
   * Remove um usuário (soft delete).
   */
  async deleteUser(
    id: string,
    deletedBy: string,
    client?: PrismaClient,
  ): Promise<void> {
    const prismaClient = client || this.prisma;

    await prismaClient.user.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by: deletedBy,
      },
    });
  }

  /**
   * Gets the last login date for a user from UserAccess records
   */
  async getLastLogin(userId: string): Promise<UserAccess | null> {
    return await this.prisma.userAccess.findFirst({
      where: {
        user_id: userId,
        url: '/auth/login',
        method: MethodEnum.POST,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  /**
   * Creates a UserAccess record for login
   */
  async createUserAccess(
    userId: string,
    ipAddress: string,
    userAgent: string,
    url: string = '/auth/login',
    method: MethodEnum = MethodEnum.POST,
    deviceName: string = 'Unknown',
    client?: PrismaClient,
  ): Promise<UserAccess> {
    const prismaClient = client || this.prisma;

    return await prismaClient.userAccess.create({
      data: {
        user_id: userId,
        ip_address: ipAddress,
        user_agent: userAgent,
        device_name: deviceName,
        url,
        method,
      },
    });
  }
}
