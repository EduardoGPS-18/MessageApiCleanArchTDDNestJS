import { Payload, SessionHandler } from '@application/protocols';
import { ValidateUserUseCase } from '@application/usecases';
import { UserEntity } from '@domain/entities';
import { DomainError } from '@domain/errors/domain.error';
import { UserRepository } from '@domain/repositories';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

class UserRepositoryStub implements UserRepository {
  insert(user: UserEntity): Promise<void> {
    return;
  }
  update(user: UserEntity): Promise<void> {
    return;
  }
  findOneById(id: string): Promise<UserEntity> {
    return Promise.resolve(
      UserEntity.create({
        id: 'any_id',
        email: 'any_email',
        name: 'any_name',
        password: 'any_password',
        session: 'any_session',
      }),
    );
  }
  findOneByEmail(email: string): Promise<UserEntity> {
    return;
  }
  findUserListByIdList(idList: string[]): Promise<UserEntity[]> {
    return;
  }
}

class SessionHandlerStub implements SessionHandler {
  verifySession(session: string): Payload {
    return {
      id: 'any_id',
      email: 'any_email',
    };
  }
  generateSession(payload: Payload): string {
    return 'generated_session';
  }
}

type SutTypes = {
  sut: ValidateUserUseCase;
  userRepository: UserRepositoryStub;
  sessionHandler: SessionHandlerStub;
};
const makeSut = () => {
  const sessionHandlerStub = new SessionHandlerStub();
  const userRepositoryStub = new UserRepositoryStub();
  const sut = new ValidateUserUseCase(sessionHandlerStub, userRepositoryStub);
  return { sut, userRepositoryStub, sessionHandlerStub };
};

describe('ValidateUser Use Case', () => {
  it('Should call dependencies correctly', async () => {
    const { sut, userRepositoryStub, sessionHandlerStub } = makeSut();
    jest.spyOn(sessionHandlerStub, 'verifySession');
    jest.spyOn(userRepositoryStub, 'findOneById');

    await sut.execute({ session: 'any_session' });
    expect(userRepositoryStub.findOneById).toHaveBeenCalledWith('any_id');
    expect(sessionHandlerStub.verifySession).toHaveBeenCalledWith(
      'any_session',
    );
  });

  it('Should throw DomainError.InvalidUser if payload is empty', async () => {
    const { sut, sessionHandlerStub } = makeSut();
    jest.spyOn(sessionHandlerStub, 'verifySession').mockReturnValueOnce(null);
    const promise = sut.execute({ session: 'any_session' });

    await expect(promise).rejects.toThrowError(DomainError.InvalidUser);
  });

  it('Should throw DomainError.InvalidUser if payload.id is empty', async () => {
    const { sut, sessionHandlerStub } = makeSut();
    jest.spyOn(sessionHandlerStub, 'verifySession').mockReturnValueOnce({
      id: '',
      email: 'valid_email',
    });
    const promise = sut.execute({ session: 'any_session' });

    await expect(promise).rejects.toThrowError(DomainError.InvalidUser);
  });

  it('Should throw DomainError.InvalidUser if payload.email is empty', async () => {
    const { sut, sessionHandlerStub } = makeSut();
    jest.spyOn(sessionHandlerStub, 'verifySession').mockReturnValueOnce({
      id: 'valid_id',
      email: '',
    });
    const promise = sut.execute({ session: 'any_session' });

    await expect(promise).rejects.toThrowError(DomainError.InvalidUser);
  });

  it('Should throw DomainError.InvalidUser if session unmatch with storage session', async () => {
    const { sut, userRepositoryStub } = makeSut();
    jest.spyOn(userRepositoryStub, 'findOneById').mockResolvedValueOnce(
      UserEntity.create({
        id: 'any_id',
        email: 'any_email',
        name: 'any_name',
        password: 'any_password',
        session: 'another_session',
      }),
    );
    const promise = sut.execute({ session: 'any_session' });

    await expect(promise).rejects.toThrowError(DomainError.InvalidUser);
  });

  it('Should throw DomainError.InvalidUser if user isnt found', async () => {
    const { sut, userRepositoryStub } = makeSut();
    jest.spyOn(userRepositoryStub, 'findOneById').mockResolvedValueOnce(null);
    const promise = sut.execute({ session: 'any_session' });

    await expect(promise).rejects.toThrowError(DomainError.InvalidUser);
  });

  it('Should return UserEntity on operation success', async () => {
    const { sut, userRepositoryStub } = makeSut();
    const user = await sut.execute({ session: 'any_session' });

    expect(user).toEqual(
      UserEntity.create({
        id: 'any_id',
        email: 'any_email',
        name: 'any_name',
        password: 'any_password',
        session: 'any_session',
      }),
    );
  });
});
