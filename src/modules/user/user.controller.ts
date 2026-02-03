import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { IdParamDto } from 'src/core/interfaces/dto/id-param.dto';
import { PaginationQueryDto } from 'src/core/interfaces/request/dto/pagination-query.dto';
import { ListUserFilterDto } from './dto/list-user-filter.dto';
import { PaginatedResult } from 'src/core/helper/interface/helper.types';
import type { CustomRequestI } from 'src/core/interfaces/custom-request.interface';
import { Prisma, User } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { UserDto } from './dto/user.dto';
import {
  ApiUserControllerDefaults,
  ApiCreateUserResponse,
  ApiListUsersResponse,
  ApiUpdateUserResponse,
  ApiDeleteUserResponse,
} from './user.swagger';

@ApiUserControllerDefaults()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Busca um usuário pelo ID.
   * @param id - Contém o CUID do usuário.
   * @returns O usuário correspondente ao CUID fornecido ou null, caso não seja encontrado.
   */
  @Get(':id')
  async getUserById(@Param() dto: IdParamDto): Promise<User | null> {
    return this.userService.getUserById(dto.id);
  }

  /**
   * Registra um novo usuário.
   * @param data - Contém os dados para criar o novo usuário.
   * @returns O usuário criado.
   */
  @Post()
  @ApiCreateUserResponse()
  async createUser(@Body() data: UserDto): Promise<User> {
    return this.userService.createUser({
      ...data,
    });
  }

  /**
   * Lista todos os usuários.
   * @returns Uma lista de todos os usuários.
   */
  @Get()
  @ApiListUsersResponse()
  async getAllUsers(
    @Query() query: PaginationQueryDto,
    @Query() filter: ListUserFilterDto,
  ): Promise<PaginatedResult<User>> {
    return await this.userService.getAllUsers(query, filter);
  }

  /**
   * Atualiza um usuário pelo ID.
   * @param id - Contém o CUID do usuário a ser atualizado.
   * @param data - Contém os dados para atualizar o usuário.
   * @returns O usuário atualizado.
   */
  @Put(':id')
  @ApiUpdateUserResponse()
  async updateUser(
    @Param() id: IdParamDto,
    @Body() data: Prisma.UserUpdateInput,
  ): Promise<User> {
    return this.userService.updateUser(id.id, data);
  }

  @Delete(':id')
  @ApiDeleteUserResponse()
  async deleteUser(
    @Param() id: IdParamDto,
    @Req() req: CustomRequestI,
  ): Promise<void> {
    return this.userService.deleteUser(id.id, req.user.user_id);
  }
}
