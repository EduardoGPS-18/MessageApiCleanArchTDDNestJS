import { ValidateUserUseCaseI } from '@application/usecases';
import { UserEntity } from '@domain/entities';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly validateUserUseCase: ValidateUserUseCaseI) {}

  addUserOnRequest(req: Request, user: UserEntity): void {
    req.body.user = user;
  }

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
      this.addUserOnRequest(request, user);
      return !!user;
    } catch (err) {
      if (err instanceof TypeError) {
        throw new InternalServerErrorException();
      }
      throw new ForbiddenException();
    }
  }

  test(arg: any): void {
    arg.x = { test: 'teste' };
  }
}
