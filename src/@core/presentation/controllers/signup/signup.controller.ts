import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { RegisterUserUseCaseI } from '../../../../application/usecases';
import { DomainError } from '../../../../domain/errors/domain.error';
import { SignupUserDto } from '../../dtos';
import { UserMapper } from '../../mappers';

@Controller('auth')
export class SignupController {
  constructor(private readonly addUserUseCase: RegisterUserUseCaseI) {}

  @Post('signup')
  async handle(@Body() signupDto: SignupUserDto) {
    const { name, email, password: rawPassword } = signupDto;
    try {
      const user = await this.addUserUseCase.execute({
        name,
        email,
        rawPassword,
      });
      return UserMapper.toAuthenticatedUser(user);
    } catch (err) {
      if (err instanceof DomainError.CredentialsAlreadyInUse) {
        throw new BadRequestException();
      }
      throw new InternalServerErrorException();
    }
  }
}
