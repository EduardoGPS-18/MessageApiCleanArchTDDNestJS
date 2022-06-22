import { ValidateUserProps, ValidateUserUseCaseI } from '@application/usecases';
import { UserEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '@presentation/helpers/guard';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));
let context: ExecutionContext = jest.genMockFromModule('@nestjs/common');

class ValidateUserUseCaseStub implements ValidateUserUseCaseI {
  execute({ session }: ValidateUserProps): Promise<UserEntity> {
    return Promise.resolve(
      UserEntity.create({
        id: 'any_id',
        name: 'any_name',
        email: 'any_email',
        password: 'any_password',
      }),
    );
  }
}

describe('JwtAuthGuard Tests', () => {
  beforeEach(() => {
    context.switchToHttp = (): any => ({
      getRequest: () => ({
        headers: {
          authorization: 'Bearer any-token',
        },
        body: {},
      }),
    });
  });

  it('Should call usecase correctly', async () => {
    const validateUserStub = new ValidateUserUseCaseStub();
    jest.spyOn(validateUserStub, 'execute');
    const sut = new JwtAuthGuard(validateUserStub);

    await sut.canActivate(context);

    expect(validateUserStub.execute).toHaveBeenCalledWith({
      session: 'any-token',
    });
  });

  it('Should throw Forbidden if token isnt provided', async () => {
    context.switchToHttp = jest.fn().mockReturnValueOnce({
      getRequest: () => ({
        headers: {},
        body: {},
      }),
    });
    const validateUserStub = new ValidateUserUseCaseStub();
    const sut = new JwtAuthGuard(validateUserStub);

    const promise = sut.canActivate(context);

    await expect(promise).rejects.toThrowError(ForbiddenException);
  });

  it('Should throw Forbidden if ValidateUser throws', async () => {
    const validateUserStub = new ValidateUserUseCaseStub();
    jest
      .spyOn(validateUserStub, 'execute')
      .mockRejectedValueOnce(new DomainError.InvalidUser());
    const sut = new JwtAuthGuard(validateUserStub);

    const promise = sut.canActivate(context);

    await expect(promise).rejects.toThrowError(ForbiddenException);
  });

  it('Should add to context.body user on validation succeed', async () => {
    const validateUserStub = new ValidateUserUseCaseStub();

    const localContext: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: 'Bearer any-token',
          },
          body: {},
        }),
      }),
    };

    const sut = new JwtAuthGuard(validateUserStub);
    sut.addUserOnRequest = jest.fn();

    await sut.canActivate(localContext);

    expect(sut.addUserOnRequest).toBeCalledTimes(1);
  });

  it('Should return true on validation succeed', async () => {
    const validateUserStub = new ValidateUserUseCaseStub();
    const sut = new JwtAuthGuard(validateUserStub);

    const result = await sut.canActivate(context);
    expect(result).toBe(true);
  });

  it('Should update user property on request', () => {
    const validateUserStub = new ValidateUserUseCaseStub();
    const sut = new JwtAuthGuard(validateUserStub);

    const request: any = {
      body: {},
    };
    const user = UserEntity.create({
      id: 'any_id',
      name: 'any_name',
      email: 'any_email',
      password: 'any_password',
    });
    sut.addUserOnRequest(request, user);
    expect(request.body.user).toEqual(user);
  });
});
