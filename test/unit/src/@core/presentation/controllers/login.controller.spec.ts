import { LoginUserUseCaseStub } from '@application-unit/mocks/usecases';
import { LoginUserUseCaseI } from '@application/usecases';
import { UserEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { LoginController } from '@presentation/controllers';

const mockedUser: UserEntity = {
  id: 'any_id',
  name: 'any_name',
  email: 'any_email',
  createdAt: new Date(),
  updatedAt: new Date(),
  password: 'any_password',
  session: 'any_session',
  updateSession: jest.fn(),
};

type SutTypes = {
  sut: LoginController;
  loginUseCaseStub: LoginUserUseCaseI;
};
const makeSut = (): SutTypes => {
  const loginUseCaseStub = new LoginUserUseCaseStub();
  const sut = new LoginController(loginUseCaseStub);

  loginUseCaseStub.execute = jest.fn().mockResolvedValue(mockedUser);

  return { sut, loginUseCaseStub };
};

describe('Login || Controller || Suit ', () => {
  it('Should call login usecase correctly', async () => {
    const { sut, loginUseCaseStub } = makeSut();

    await sut.handle({
      email: 'any_email',
      password: 'any_password',
    });

    expect(loginUseCaseStub.execute).toHaveBeenCalledWith({
      email: 'any_email',
      rawPassword: 'any_password',
    });
  });

  it('Should return authenticated user on operation succeed', async () => {
    const { sut } = makeSut();

    const user = await sut.handle({
      email: 'any_email',
      password: 'any_password',
    });

    expect(user).toEqual({
      id: 'any_id',
      name: 'any_name',
      email: 'any_email',
      accessToken: 'any_session',
    });
  });

  it('Should throw BadRequest on InvalidCredentials', async () => {
    const { sut, loginUseCaseStub } = makeSut();
    jest
      .spyOn(loginUseCaseStub, 'execute')
      .mockRejectedValueOnce(new DomainError.InvalidCredentials());

    const promise = sut.handle({
      email: 'any_email',
      password: 'any_password',
    });

    await expect(promise).rejects.toThrowError(BadRequestException);
  });

  it('Should throw InternalServerError on Unexpected', async () => {
    const { sut, loginUseCaseStub } = makeSut();
    jest
      .spyOn(loginUseCaseStub, 'execute')
      .mockRejectedValueOnce(new DomainError.Unexpected());

    const promise = sut.handle({
      email: 'any_email',
      password: 'any_password',
    });

    await expect(promise).rejects.toThrowError(InternalServerErrorException);
  });
});
