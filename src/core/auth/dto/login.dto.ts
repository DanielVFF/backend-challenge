import { IsEmail, IsString, MinLength } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { plainToClassDefault } from 'src/core/helper/utils/plainToClassDefault';

export class LoginDto {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'danielvitorpnn@gmail.com',
  })
  @IsEmail({}, { message: 'O email deve ser válido' })
  email: string;

  @ApiProperty({
    description: 'A senha do usuário',
    example: 'SenhaSegura123#',
  })
  @IsString({ message: 'A senha deve ser uma string' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password?: string | null;
}

export function loginDtoFactory(data: Partial<LoginDto>): LoginDto {
  return plainToClassDefault(LoginDto, data);
}
