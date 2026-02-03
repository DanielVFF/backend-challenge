import { Expose } from '@nestjs/class-transformer';
import { plainToClassDefault } from 'src/core/helper/utils/plainToClassDefault';

export enum ProviderEnum {
  GOOGLE = 'GOOGLE',
  CINEMA = 'CINEMA',
}

export class UserProviderDto {
  @Expose()
  id_user_provider: string;

  @Expose()
  user_id: string;

  @Expose()
  provider: ProviderEnum;

  @Expose()
  provider_id: string;
}

export function UserProviderDtoFactory(
  user: Partial<UserProviderDto>,
): UserProviderDto {
  return plainToClassDefault(UserProviderDto, user);
}
