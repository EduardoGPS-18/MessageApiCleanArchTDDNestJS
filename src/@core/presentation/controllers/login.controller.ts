import { LoginUserUseCaseI } from '@application/usecases';
import { DomainError } from '@domain/errors';
import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { AuthenticatedUserDto, LoginUserDto } from '@presentation/dtos';
import { UserMapper } from '@presentation/mappers';

@Controller('auth')
export class LoginController {
  constructor(private loginUseCase: LoginUserUseCaseI) {}

  @Post('login')
  async handle(@Body() loginDto: LoginUserDto): Promise<AuthenticatedUserDto> {
    try {
      const { email, password: rawPassword } = loginDto;
      const user = await this.loginUseCase.execute({ email, rawPassword });
      return UserMapper.toAuthenticatedUser(user);
    } catch (err) {
      if (err instanceof DomainError.InvalidCredentials) {
        throw new BadRequestException();
      }
      throw new InternalServerErrorException();
    }
  }
}
