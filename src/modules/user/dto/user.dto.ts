import { Expose, Type } from '@nestjs/class-transformer';
import { UserProviderDto } from './provider.dto/user-provider.dto';
import { plainToClassDefault } from 'src/core/helper/utils/plainToClassDefault';

export class UserDto {
  @Expose()
  user_id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  cellphone: string;

  @Expose()
  createdAt: Date;

  @Expose()
  createdBy: string;

  @Expose()
  deletedAt?: Date | null;

  @Expose()
  @Type(() => UserProviderDto)
  userProviders: UserProviderDto[];

  // not exposed
  password: string;
  deletedBy?: string | null;
}

export function userDtoFactory(user: Partial<UserDto>): UserDto {
  return plainToClassDefault(UserDto, user);
}
