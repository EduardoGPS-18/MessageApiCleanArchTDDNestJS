import * as crypto from 'crypto'; // (* as mod) CUIDADO AO IMPORTAR !

import { DomainError, RepositoryError } from '@domain/errors';

import { HasherStub, SessionHandlerStub } from '@application-unit/mocks';
import { RegisterUserUseCase } from '@application/usecases';
import { UserRepositoryStub } from '@domain-unit/mocks';
import { UserEntity } from '@domain/entities';

jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'gen_uuid'),
}));
jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

const mockedUser = UserEntity.create({
  id: 'any_id',
  email: 'any_email',
  name: 'any_name',
  session: 'any_session',
  password: 'any_pass',
});

type SutTypes = {
  sut: RegisterUserUseCase;
  hasher: HasherStub;
  userRepository: UserRepositoryStub;
  sessionHandler: SessionHandlerStub;
};
const makeSut = (): SutTypes => {
  const userRepository = new UserRepositoryStub();
  const hasher = new HasherStub();
  const sessionHandler = new SessionHandlerStub();
  const sut = new RegisterUserUseCase(userRepository, hasher, sessionHandler);

  hasher.hash = jest.fn().mockResolvedValue('gen_hash');
  userRepository.findOneByEmail = jest.fn().mockReturnValue(null);
  sessionHandler.generateSession = jest
    .fn()
    .mockReturnValue('generated_session');

  return { sut, hasher, userRepository, sessionHandler };
};

describe('RegisterUser || UseCase || Suit', () => {
  it('Should call dependencies with correct values', async () => {
    const { sut, hasher, userRepository, sessionHandler } = makeSut();

    await sut.execute({
      email: 'user_email',
      name: 'user_name',
      rawPassword: 'user_pass',
    });

    expect(hasher.hash).toHaveBeenCalledWith('user_pass');
    expect(crypto.randomUUID).toHaveBeenCalled();
    expect(sessionHandler.generateSession).toHaveBeenCalledWith({
      id: 'gen_uuid',
      email: 'user_email',
    });
    expect(userRepository.findOneByEmail).toBeCalledWith('user_email');
    const expectedUser: UserEntity = UserEntity.create({
      id: 'gen_uuid',
      name: 'user_name',
      email: 'user_email',
      password: 'gen_hash',
      session: 'generated_session',
    });
    expect(userRepository.insert).toHaveBeenCalledWith(expectedUser);
  });

  it('Should throw if userRepository throws', async () => {
    const { sut, userRepository } = makeSut();
    jest
      .spyOn(userRepository, 'insert')
      .mockRejectedValueOnce(new RepositoryError.OperationError());

    const promise = sut.execute({
      email: 'user_email',
      name: 'user_name',
      rawPassword: 'user_pass',
    });

    await expect(promise).rejects.toThrowError(DomainError.Unexpected);
  });

  it('Should throw if hasher throws', async () => {
    const { sut, hasher } = makeSut();
    jest.spyOn(hasher, 'hash').mockRejectedValueOnce(new Error());

    const promise = sut.execute({
      email: 'user_email',
      name: 'user_name',
      rawPassword: 'user_pass',
    });

    await expect(promise).rejects.toThrowError(DomainError.Unexpected);
  });

  it('Should thorws if email exists in repository', async () => {
    const { sut, userRepository } = makeSut();
    jest
      .spyOn(userRepository, 'findOneByEmail')
      .mockResolvedValueOnce(mockedUser);

    const promise = sut.execute({
      email: 'user_email',
      name: 'user_name',
      rawPassword: 'user_pass',
    });

    await expect(promise).rejects.toThrowError(
      DomainError.CredentialsAlreadyInUse,
    );
  });

  it('Should return an user on success', async () => {
    const { sut } = makeSut();

    const user = await sut.execute({
      email: 'user_email',
      name: 'user_name',
      rawPassword: 'user_pass',
    });

    expect(user).toEqual({
      id: 'gen_uuid',
      email: 'user_email',
      name: 'user_name',
      password: 'gen_hash',
      session: 'generated_session',
      createdAt: new Date('2020-01-01'),
      updatedAt: new Date('2020-01-01'),
    });
  });
});
