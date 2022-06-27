import { ValidateUserUseCaseStub } from '@application-unit/mocks/usecases';
import { UserEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '@presentation/helpers/guard';
import { PresentationHelpers } from '@presentation/helpers/methods';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

let context: ExecutionContext = jest.genMockFromModule('@nestjs/common');

const mockedUser = UserEntity.create({
  id: 'any_id',
  name: 'any_name',
  email: 'any_email',
  password: 'any_password',
});

type SutTypes = {
  validateUser: ValidateUserUseCaseStub;
  sut: JwtAuthGuard;
};
const makeSut = (): SutTypes => {
  const validateUser = new ValidateUserUseCaseStub();
  const sut = new JwtAuthGuard(validateUser);

  PresentationHelpers.addUserToObject = jest.fn();
  validateUser.execute = jest.fn().mockResolvedValue(mockedUser);
  context.switchToHttp = (): any => ({
    getRequest: () => ({
      headers: {
        authorization: 'Bearer any-token',
      },
      body: {},
    }),
  });

  return { sut, validateUser };
};

describe('JwtAuth || Guard || Suit', () => {
  it('Should call usecase correctly', async () => {
    const { sut, validateUser } = makeSut();

    await sut.canActivate(context);

    expect(validateUser.execute).toHaveBeenCalledWith({
      session: 'any-token',
    });
  });

  it('Should throw Forbidden if token isnt provided', async () => {
    const { sut } = makeSut();
    context.switchToHttp = jest.fn().mockReturnValueOnce({
      getRequest: () => ({
        headers: {},
        body: {},
      }),
    });

    const promise = sut.canActivate(context);

    await expect(promise).rejects.toThrowError(ForbiddenException);
  });

  it('Should throw Forbidden if ValidateUser throws', async () => {
    const { sut, validateUser } = makeSut();
    jest
      .spyOn(validateUser, 'execute')
      .mockRejectedValueOnce(new DomainError.InvalidUser());

    const promise = sut.canActivate(context);

    await expect(promise).rejects.toThrowError(ForbiddenException);
  });

  it('Should call PresentationHelpers.addUserToObject with correct values', async () => {
    const { sut } = makeSut();
    const request = context.switchToHttp().getRequest();

    await sut.canActivate(context as any);

    expect(PresentationHelpers.addUserToObject).toBeCalledWith(
      request.body,
      mockedUser,
    );
  });

  it('Should return true on validation succeed', async () => {
    const { sut } = makeSut();

    const result = await sut.canActivate(context);

    expect(result).toBe(true);
  });
});
