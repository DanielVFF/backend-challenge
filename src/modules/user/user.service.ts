import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationQueryDto } from 'src/core/interfaces/request/dto/pagination-query.dto';
import { ListUserFilterDto } from './dto/list-user-filter.dto';
import { PaginatedResult } from 'src/core/helper/interface/helper.types';
import { UserRepository } from './user.repository';
import { Prisma, User } from '@prisma/client';
import { hashPassword } from 'src/core/helper/utils/hash-password';
import { paginate } from 'src/core/helper/utils/paginate';
import { UserDto } from './dto/user.dto';
import {
  ProviderEnum,
  UserProviderDtoFactory,
} from './dto/provider.dto/user-provider.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUserById(id: string): Promise<User | null> {
    const user = await this.userRepository.getUserByFilter({
      id,
    });
    return user;
  }

  /**
   * Cria um novo usuário, verificando se o email já está cadastrado.
   */
  async createUser(data: UserDto): Promise<User> {
    await this.validateUser(data);

    if (data.password) data.password = await hashPassword(data.password);
    const user = await this.userRepository.createUser(data);

    return user;
  }

  async getOrCreateUser(data: UserDto): Promise<User> {
    const user = await this.userRepository.getUserByFilter({
      email: data?.email,
    });
    if (user) {
      return user;
    }
    return this.createUser(data);
  }

  async upsertProvider(
    user_id: string,
    provider: ProviderEnum,
    provider_id: string,
  ): Promise<void> {
    await this.userRepository.upsertProvider(
      UserProviderDtoFactory({
        user_id,
        provider,
        provider_id,
      }),
    );
  }

  private async validateUser(data: UserDto): Promise<void> {
    const user = await this.userRepository.getUserByFilter({
      email: data?.email,
    });
    if (user) {
      throw new ConflictException('errors.email_already_exists');
    }

    return;
  }

  async getAllUsers(
    query: PaginationQueryDto,
    filter: ListUserFilterDto,
  ): Promise<PaginatedResult<User>> {
    const result = await paginate(
      query,
      () => this.userRepository.countTotalUsers(filter),
      () => this.userRepository.getAllUsers(query, filter),
    );

    return result;
  }

  async updateUser(
    id: string,
    updateData: Prisma.UserUpdateInput,
  ): Promise<User> {
    if (updateData?.email) {
      const userByEmail = await this.userRepository.getUserByFilter({
        email: updateData?.email as string,
      });
      if (userByEmail?.id !== id) {
        throw new ConflictException('errors.email_already_registered');
      }
    }

    if (updateData?.password) {
      updateData.password = await hashPassword(updateData.password as string);
    }

    const updatedUser = await this.userRepository.updateUser(id, updateData);

    return updatedUser;
  }

  async deleteUser(user_id: string, deletedBy: string): Promise<void> {
    return await this.userRepository.deleteUser(user_id, deletedBy);
  }
}
