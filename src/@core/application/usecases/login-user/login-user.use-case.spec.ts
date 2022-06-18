import { UserEntity } from '../../../domain/entities';
import { DomainError } from '../../../domain/errors/domain.error';
import { RepositoryError } from '../../../domain/errors/repository.error';
import { UserRepository } from '../../../domain/repositories';
import {
  Encrypter,
  EncryptProps,
  Payload,
  SessionHandler,
} from '../../protocols';
import { LoginUserUseCase } from './login-user.use-case';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

class UserRepositoryStub implements UserRepository {
  update(user: UserEntity): Promise<void> {
    return;
  }
  insert(user: UserEntity): Promise<void> {
    return;
  }
  findOneByEmail(email: string): Promise<UserEntity> {
    return Promise.resolve(
      UserEntity.create({
        id: 'any_id',
        name: 'any_name',
        email: 'user_email',
        password: 'any_hashed_password',
      }),
    );
  }
}

class EncrypterStub implements Encrypter {
  compare(props: EncryptProps): Promise<boolean> {
    return Promise.resolve(true);
  }
}

class SessionHandlerStub implements SessionHandler {
  generateSession(payload: Payload): string {
    return 'generated_session';
  }
}

type SutTypes = {
  sut: LoginUserUseCase;
  encryptStub: EncrypterStub;
  userRepositoryStub: UserRepositoryStub;
  sessionHandlerStub: SessionHandlerStub;
};

const makeSut = (): SutTypes => {
  const userRepositoryStub = new UserRepositoryStub();
  const encryptStub = new EncrypterStub();
  const sessionHandlerStub = new SessionHandlerStub();
  const sut = new LoginUserUseCase(
    encryptStub,
    userRepositoryStub,
    sessionHandlerStub,
  );
  return { sut, encryptStub, userRepositoryStub, sessionHandlerStub };
};

describe('Login User Usecase', () => {
  it('Should call dependencies with correct values', async () => {
    const { sut, encryptStub, userRepositoryStub, sessionHandlerStub } =
      makeSut();
    jest.spyOn(userRepositoryStub, 'findOneByEmail');
    jest.spyOn(userRepositoryStub, 'update');
    jest.spyOn(encryptStub, 'compare');
    jest.spyOn(sessionHandlerStub, 'generateSession');
    await sut.execute({
      email: 'user_email',
      rawPassword: 'user_pass',
    });
    expect(userRepositoryStub.findOneByEmail).toHaveBeenCalledWith(
      'user_email',
    );
    expect(sessionHandlerStub.generateSession).toHaveBeenCalledWith({
      id: 'any_id',
      email: 'user_email',
    });
    expect(encryptStub.compare).toHaveBeenCalledWith({
      value: 'user_pass',
      hash: 'any_hashed_password',
    });
    expect(userRepositoryStub.update).toHaveBeenCalledWith(
      UserEntity.create({
        id: 'any_id',
        email: 'user_email',
        name: 'any_name',
        password: 'any_hashed_password',
        session: 'generated_session',
      }),
    );
  });

  it('Should throw InvalidCredentials if user not found on repository', async () => {
    const { sut, userRepositoryStub } = makeSut();
    jest
      .spyOn(userRepositoryStub, 'findOneByEmail')
      .mockResolvedValueOnce(null);

    const promise = sut.execute({
      email: 'any_mail',
      rawPassword: 'any_pass',
    });

    await expect(promise).rejects.toThrowError(DomainError.InvalidCredentials);
  });

  it('Should throw InvalidCredentials if user not found on repository', async () => {
    const { sut, encryptStub } = makeSut();
    jest.spyOn(encryptStub, 'compare').mockResolvedValueOnce(false);

    const promise = sut.execute({
      email: 'any_mail',
      rawPassword: 'any_pass',
    });

    await expect(promise).rejects.toThrowError(DomainError.InvalidCredentials);
  });

  it('Should throw if repository throws', async () => {
    const { sut, userRepositoryStub } = makeSut();
    jest
      .spyOn(userRepositoryStub, 'findOneByEmail')
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
    const mockedUser = UserEntity.create({
      id: 'any_id',
      name: 'any_name',
      email: 'user_email',
      password: 'any_hashed_password',
      session: 'generated_session',
    });

    expect(user).toEqual(mockedUser);
  });
});
