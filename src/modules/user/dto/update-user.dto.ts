import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  Matches,
  IsArray,
  ArrayMinSize,
} from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from '@nestjs/class-validator';
import { Expose } from '@nestjs/class-transformer';
import { plainToClassDefault } from 'src/core/helper/utils/plainToClassDefault';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Nome do usuário',
    example: 'Daniel Vitor',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  @Expose()
  name?: string;

  @ApiProperty({
    description: 'O e-mail do usuário',
    example: 'daniel.faria@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email deve ser válido' })
  @Expose()
  email?: string;

  @ApiProperty({
    description: 'A senha do usuário',
    example: 'senhaSegura123#',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(12, { message: 'Senha deve ter no mínimo 12 caracteres' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&()_+=\[\]{};':"\\|,.<>\/~`^-])[A-Za-z\d@$!%*#?&()_+=\[\]{};':"\\|,.<>\/~`^-]{12,}$/,
    {
      message:
        'Senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial',
    },
  )
  @Expose()
  password?: string;
}

export function updateUserDtoFactory(
  data: Partial<UpdateUserDto>,
): UpdateUserDto {
  return plainToClassDefault(UpdateUserDto, data);
}
