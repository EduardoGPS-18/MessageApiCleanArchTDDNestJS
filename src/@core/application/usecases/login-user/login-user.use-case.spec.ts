import { UserEntity } from '../../../../@core/domain/entities';
import { DomainError } from '../../../../@core/domain/errors/domain.error';
import { RepositoryError } from '../../../../@core/domain/errors/repository.error';
import { UserRepository } from '../../../../@core/domain/repositories';
import { Encrypter, EncryptProps } from '../../protocols';
import { LoginUserUseCase } from './login-user.use-case';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

class UserRepositoryStub implements UserRepository {
  insert(user: UserEntity): Promise<void> {
    return;
  }
  findOneByEmail(email: string): Promise<UserEntity> {
    return Promise.resolve({
      id: 'any_id',
      name: 'any_name',
      email: 'any_email',
      password: 'any_hash',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

class EncrypterStub implements Encrypter {
  compare(props: EncryptProps): Promise<boolean> {
    return Promise.resolve(true);
  }
}
type SutTypes = {
  sut: LoginUserUseCase;
  encryptStub: EncrypterStub;
  userRepositoryStub: UserRepositoryStub;
};

const makeSut = (): SutTypes => {
  const userRepositoryStub = new UserRepositoryStub();
  const encryptStub = new EncrypterStub();
  const sut = new LoginUserUseCase(encryptStub, userRepositoryStub);
  return { sut, encryptStub, userRepositoryStub };
};

describe('Login User Usecase', () => {
  it('Should call dependencies with correct values', async () => {
    const { sut, encryptStub, userRepositoryStub } = makeSut();
    jest.spyOn(userRepositoryStub, 'findOneByEmail');
    jest.spyOn(encryptStub, 'compare');
    await sut.execute({
      email: 'user_email',
      rawPassword: 'user_pass',
    });
    expect(userRepositoryStub.findOneByEmail).toHaveBeenCalledWith(
      'user_email',
    );
    expect(encryptStub.compare).toHaveBeenCalledWith({
      value: 'user_pass',
      hash: 'any_hash',
    });
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
    const { sut, userRepositoryStub } = makeSut();

    const user = await sut.execute({
      email: 'any_mail',
      rawPassword: 'any_pass',
    });

    expect(user).toEqual({
      id: 'any_id',
      name: 'any_name',
      email: 'any_email',
      password: 'any_hash',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });
});
