import {
  IsString,
  IsEmail,
  MinLength,
  Matches,
  IsOptional,
} from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.dto';
import { StrictPartial } from 'src/core/helper/types/strict-partial';
import { IsCellphone } from 'src/core/helper/decorators/is.cellphone.decorator';

export class CreateUserDto implements StrictPartial<UserDto> {
  @ApiProperty({
    example: 'Daniel Vitor',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'daniel.faria@example.com',
  })
  @IsEmail({}, { message: 'Email must be a valid email' })
  email: string;

  @ApiProperty({
    example: '11999999999',
  })
  @IsString()
  @IsCellphone({ message: 'Cellphone must be a valid cellphone' })
  @IsOptional()
  cellphone: string;

  @ApiProperty({
    example: 'SenhaSegura123#',
  })
  @IsString()
  @MinLength(12, { message: 'Password must be at least 12 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&()_+=[\]{};':"\\|,.<>/~`^-])[A-Za-z\d@$!%*#?&()_+=[\]{};':"\\|,.<>/~`^-]{12,}$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    },
  )
  password: string;
}
