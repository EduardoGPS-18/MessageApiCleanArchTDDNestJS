import { RegisterUserUsecaseStub } from '@application-unit/mocks/usecases';
import { UserEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SignupController } from '@presentation/controllers';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

const mockedRegisteredUser: UserEntity = {
  id: 'any_id',
  name: 'any_name',
  password: 'any_password',
  email: 'any_email',
  session: 'any_session',
  updatedAt: new Date(),
  createdAt: new Date(),
  updateSession: jest.fn(),
};

type SutTypes = {
  sut: SignupController;
  registerUserUsecaseStub: RegisterUserUsecaseStub;
};
const makeSut = (): SutTypes => {
  const registerUserUsecaseStub = new RegisterUserUsecaseStub();
  const sut = new SignupController(registerUserUsecaseStub);

  registerUserUsecaseStub.execute = jest
    .fn()
    .mockResolvedValue(mockedRegisteredUser);

  return { sut, registerUserUsecaseStub };
};

describe('Signup || Controller || Suit', () => {
  it('Should call usecase correctly', async () => {
    const { sut, registerUserUsecaseStub } = makeSut();

    await sut.handle({
      email: 'any_email',
      name: 'any_name',
      password: 'any_password',
    });

    expect(registerUserUsecaseStub.execute).toHaveBeenCalledWith({
      email: 'any_email',
      name: 'any_name',
      rawPassword: 'any_password',
    });
  });

  it('Should throw BadRequest on CredentialsAlreadyInUser', async () => {
    const { sut, registerUserUsecaseStub } = makeSut();
    jest
      .spyOn(registerUserUsecaseStub, 'execute')
      .mockRejectedValueOnce(new DomainError.CredentialsAlreadyInUse());

    const promise = sut.handle({
      email: 'any_email',
      name: 'any_name',
      password: 'any_password',
    });

    await expect(promise).rejects.toThrow(BadRequestException);
  });

  it('Should throw InternalServerError on UnexpectedError', async () => {
    const { sut, registerUserUsecaseStub } = makeSut();
    jest
      .spyOn(registerUserUsecaseStub, 'execute')
      .mockRejectedValueOnce(new DomainError.Unexpected());

    const promise = sut.handle({
      email: 'any_email',
      name: 'any_name',
      password: 'any_password',
    });

    await expect(promise).rejects.toThrow(InternalServerErrorException);
  });

  it('Should return AuthenticatedUserDto on succeed', async () => {
    const { sut } = makeSut();

    const user = await sut.handle({
      email: 'any_email',
      name: 'any_name',
      password: 'any_password',
    });

    expect(user).toEqual({
      id: 'any_id',
      email: 'any_email',
      name: 'any_name',
      accessToken: 'any_session',
    });
  });
});
