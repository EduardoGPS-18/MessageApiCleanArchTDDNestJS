import * as crypto from 'crypto'; // (* as mod) CUIDADO AO IMPORTAR !

import { DomainError } from '../../../domain/errors/domain.error';
import { RepositoryError } from '../../../domain/errors/repository.error';

import { AddUserUseCase } from '.';
import { UserEntity } from '../../../domain/entities';
import { UserRepository } from '../../../domain/repositories';
import { Hasher, Payload, SessionHandler } from '../../protocols';

jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'gen_uuid'),
}));
jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

class UserRepositoryStub implements UserRepository {
  findOneById(id: string): Promise<UserEntity> {
    return;
  }
  findUserListByIdList(idList: string[]): Promise<UserEntity[]> {
    return;
  }
  update(user: UserEntity): Promise<void> {
    return;
  }
  insert(user: UserEntity): Promise<void> {
    return;
  }
  findOneByEmail(email: string): Promise<UserEntity> {
    return null;
  }
}

class HasherStub implements Hasher {
  hash(value: string): Promise<string> {
    return Promise.resolve('gen_hash');
  }
}

class SessionHandlerStub implements SessionHandler {
  verifySession(session: string): Payload {
    return;
  }
  generateSession(payload: Payload): string {
    return 'generated_session';
  }
}

type SutTypes = {
  sut: AddUserUseCase;
  hasherStub: HasherStub;
  userRepositoryStub: UserRepositoryStub;
  sessionHandlerStub: SessionHandlerStub;
};
const makeSut = (): SutTypes => {
  const userRepositoryStub = new UserRepositoryStub();
  const hasherStub = new HasherStub();
  const sessionHandlerStub = new SessionHandlerStub();
  const sut = new AddUserUseCase(
    userRepositoryStub,
    hasherStub,
    sessionHandlerStub,
  );
  return { sut, hasherStub, userRepositoryStub, sessionHandlerStub };
};

describe('AddUser Use Case', () => {
  it('Should call dependencies with correct values', async () => {
    const { sut, hasherStub, userRepositoryStub, sessionHandlerStub } =
      makeSut();
    jest.spyOn(hasherStub, 'hash');
    jest.spyOn(userRepositoryStub, 'insert');
    jest.spyOn(userRepositoryStub, 'findOneByEmail');
    jest.spyOn(sessionHandlerStub, 'generateSession');

    await sut.execute({
      email: 'user_email',
      name: 'user_name',
      rawPassword: 'user_pass',
    });

    expect(hasherStub.hash).toHaveBeenCalledWith('user_pass');
    expect(crypto.randomUUID).toHaveBeenCalled();
    expect(sessionHandlerStub.generateSession).toHaveBeenCalledWith({
      id: 'gen_uuid',
      email: 'user_email',
    });
    expect(userRepositoryStub.findOneByEmail).toBeCalledWith('user_email');
    const expectedUser: UserEntity = UserEntity.create({
      id: 'gen_uuid',
      name: 'user_name',
      email: 'user_email',
      password: 'gen_hash',
      session: 'generated_session',
    });
    expect(userRepositoryStub.insert).toHaveBeenCalledWith(expectedUser);
  });

  it('Should throw if userRepository throws', async () => {
    const { sut, userRepositoryStub } = makeSut();
    jest
      .spyOn(userRepositoryStub, 'insert')
      .mockRejectedValueOnce(new RepositoryError.OperationError());
    const promise = sut.execute({
      email: 'user_email',
      name: 'user_name',
      rawPassword: 'user_pass',
    });
    await expect(promise).rejects.toThrowError(DomainError.Unexpected);
  });

  it('Should throw if hasher throws', async () => {
    const { sut, hasherStub } = makeSut();
    jest.spyOn(hasherStub, 'hash').mockRejectedValueOnce(new Error());
    const promise = sut.execute({
      email: 'user_email',
      name: 'user_name',
      rawPassword: 'user_pass',
    });
    await expect(promise).rejects.toThrowError(DomainError.Unexpected);
  });

  it('Should thorws if email exists in repository', async () => {
    const { sut, userRepositoryStub } = makeSut();
    jest.spyOn(userRepositoryStub, 'findOneByEmail').mockResolvedValueOnce({
      id: 'any_id',
      email: 'any_email',
      createdAt: new Date(),
      updatedAt: new Date(),
      name: 'any_name',
      session: 'any_session',
      updateSession: jest.fn(),
      password: 'any_pass',
    });
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
