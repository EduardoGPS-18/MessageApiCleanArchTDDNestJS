import { ValidateUserUseCaseStub } from '@application-unit/mocks/usecases';
import { UserEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import {
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtWsAuthGuard } from '@presentation/helpers/guard';
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
  sut: JwtWsAuthGuard;
  validateUser: ValidateUserUseCaseStub;
};
const makeSut = (): SutTypes => {
  const validateUser = new ValidateUserUseCaseStub();
  const sut = new JwtWsAuthGuard(validateUser);

  validateUser.execute = jest.fn().mockResolvedValue(mockedUser);
  PresentationHelpers.addUserToObject = jest.fn();
  context.switchToWs = jest.fn().mockReturnValue({
    getClient: () => ({
      handshake: {
        headers: {
          authorization: 'Bearer any-token',
        },
      },
    }),
  });

  return { sut, validateUser };
};

describe('JwtWsAuth || Guard || Suit', () => {
  it('Should call usecase correctly', async () => {
    const { sut, validateUser } = makeSut();

    await sut.canActivate(context);

    expect(validateUser.execute).toHaveBeenCalledWith({
      session: 'any-token',
    });
  });

  it('Should throw Forbidden if token isnt provided', async () => {
    const { sut } = makeSut();
    context.switchToWs = jest.fn().mockReturnValueOnce({
      getClient: () => ({
        handshake: { headers: {} },
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

  it('Should throw Forbidden if ValidateUser throws another error diferent than InvalidUser', async () => {
    const { sut, validateUser } = makeSut();
    jest.spyOn(validateUser, 'execute').mockRejectedValueOnce(new Error());

    const promise = sut.canActivate(context);

    await expect(promise).rejects.toThrowError(InternalServerErrorException);
  });

  it('Should call PresentationHelpers.addUserToObject with correct values', async () => {
    const { sut } = makeSut();

    await sut.canActivate(context);

    const client = context.switchToWs().getClient();
    expect(PresentationHelpers.addUserToObject).toBeCalledWith(
      client.data,
      mockedUser,
    );
  });

  it('Should return true on validation succeed', async () => {
    const { sut } = makeSut();

    const result = await sut.canActivate(context);

    expect(result).toBeTruthy();
  });
});
