import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';
import { ValidateUserUseCaseI } from '../../../../application/usecases/validate-user';

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
      request.body.user = user; // TODO: Find a way to can test it
      return !!user;
    } catch (err) {
      if (err instanceof TypeError) {
        throw new InternalServerErrorException();
      }
      throw new ForbiddenException();
    }
  }
}
