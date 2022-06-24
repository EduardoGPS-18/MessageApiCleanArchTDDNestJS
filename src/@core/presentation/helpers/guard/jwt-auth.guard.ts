import { ValidateUserUseCaseI } from '@application/usecases';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { GuardHelpers } from '@presentation/helpers/guard';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly validateUserUseCase: ValidateUserUseCaseI) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const httpCtx = context.switchToHttp();
    const request = httpCtx.getRequest<Request>();
    const { authorization } = request.headers;
    if (!authorization) {
      throw new ForbiddenException();
    }
    const session = authorization.split(' ')[1];
    try {
      const user = await this.validateUserUseCase.execute({ session });
      GuardHelpers.addUserToObject(request, user);
      return !!user;
    } catch (err) {
      if (err instanceof TypeError) {
        throw new InternalServerErrorException();
      }
      throw new ForbiddenException();
    }
  }
}
