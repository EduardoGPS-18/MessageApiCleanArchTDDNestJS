import {
  EncrypterStub,
  SessionHandlerStub,
} from '@application-unit/mocks/protocols';
import { LoginUserUseCase } from '@application/usecases';
import { UserRepositoryStub } from '@domain-unit/mocks';
import { UserEntity } from '@domain/entities';
import { DomainError, RepositoryError } from '@domain/errors';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

const mockedUser = UserEntity.create({
  id: 'any_id',
  name: 'any_name',
  email: 'user_email',
  password: 'any_hashed_password',
});

type SutTypes = {
  sut: LoginUserUseCase;
  encrypt: EncrypterStub;
  userRepository: UserRepositoryStub;
  sessionHandler: SessionHandlerStub;
};

const makeSut = (): SutTypes => {
  const encrypt = new EncrypterStub();
  const userRepository = new UserRepositoryStub();
  const sessionHandler = new SessionHandlerStub();
  const sut = new LoginUserUseCase(encrypt, userRepository, sessionHandler);

  sessionHandler.generateSession = jest
    .fn()
    .mockReturnValue('generated_session');
  userRepository.findOneByEmail = jest.fn().mockResolvedValue(mockedUser);
  encrypt.compare = jest.fn().mockReturnValue(true);

  return { sut, encrypt, userRepository, sessionHandler };
};

describe('LoginUser || Usecase || Suit', () => {
  it('Should call dependencies with correct values', async () => {
    const { sut, encrypt, userRepository, sessionHandler } = makeSut();

    await sut.execute({
      email: 'user_email',
      rawPassword: 'user_pass',
    });

    expect(userRepository.findOneByEmail).toHaveBeenCalledWith('user_email');
    expect(sessionHandler.generateSession).toHaveBeenCalledWith({
      id: 'any_id',
      email: 'user_email',
    });
    expect(encrypt.compare).toHaveBeenCalledWith({
      value: 'user_pass',
      hash: 'any_hashed_password',
    });
    expect(userRepository.update).toHaveBeenCalledWith({
      ...mockedUser,
      session: 'generated_session',
    });
  });

  it('Should throw InvalidCredentials if user not found on repository', async () => {
    const { sut, userRepository } = makeSut();
    jest.spyOn(userRepository, 'findOneByEmail').mockResolvedValueOnce(null);

    const promise = sut.execute({
      email: 'any_mail',
      rawPassword: 'any_pass',
    });

    await expect(promise).rejects.toThrowError(DomainError.InvalidCredentials);
  });

  it('Should throw InvalidCredentials if user not found on repository', async () => {
    const { sut, encrypt } = makeSut();
    jest.spyOn(encrypt, 'compare').mockResolvedValueOnce(false);

    const promise = sut.execute({
      email: 'any_mail',
      rawPassword: 'any_pass',
    });

    await expect(promise).rejects.toThrowError(DomainError.InvalidCredentials);
  });

  it('Should throw if repository throws', async () => {
    const { sut, userRepository } = makeSut();
    jest
      .spyOn(userRepository, 'findOneByEmail')
      .mockRejectedValueOnce(new RepositoryError.OperationError());

    const promise = sut.execute({
      email: 'any_mail',
      rawPassword: 'any_pass',
    });

    await expect(promise).rejects.toThrowError(DomainError.Unexpected);
  });

  it('Should returns user on succeed', async () => {
    const { sut } = makeSut();

    const user = await sut.execute({
      email: 'user_email',
      rawPassword: 'user_pass',
    });

    expect(user).toEqual({ ...mockedUser, session: 'generated_session' });
  });
});
