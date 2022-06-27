import { SessionHandlerStub } from '@application-unit/mocks';
import { ValidateUserUseCase } from '@application/usecases';
import { UserRepositoryStub } from '@domain-unit/mocks';
import { UserEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

const user = UserEntity.create({
  id: 'any_id',
  email: 'any_email',
  name: 'any_name',
  password: 'any_password',
  session: 'any_session',
});

type SutTypes = {
  sut: ValidateUserUseCase;
  userRepository: UserRepositoryStub;
  sessionHandler: SessionHandlerStub;
};
const makeSut = (): SutTypes => {
  const sessionHandler = new SessionHandlerStub();
  const userRepository = new UserRepositoryStub();
  const sut = new ValidateUserUseCase(sessionHandler, userRepository);

  userRepository.findOneById = jest.fn().mockResolvedValue(user);
  sessionHandler.verifySession = jest
    .fn()
    .mockReturnValue({ id: 'any_id', email: 'any_email' });
  sessionHandler.generateSession = jest
    .fn()
    .mockReturnValue('generated_session');

  return { sut, userRepository, sessionHandler };
};

describe('ValidateUser || UseCase || Suit', () => {
  it('Should call dependencies correctly', async () => {
    const { sut, userRepository, sessionHandler } = makeSut();

    await sut.execute({ session: 'any_session' });

    expect(userRepository.findOneById).toHaveBeenCalledWith('any_id');
    expect(sessionHandler.verifySession).toHaveBeenCalledWith('any_session');
  });

  it('Should throw DomainError.InvalidUser if payload is empty', async () => {
    const { sut, sessionHandler } = makeSut();
    jest.spyOn(sessionHandler, 'verifySession').mockReturnValueOnce(null);

    const promise = sut.execute({ session: 'any_session' });

    await expect(promise).rejects.toThrowError(DomainError.InvalidUser);
  });

  it('Should throw DomainError.InvalidUser if payload.id is empty', async () => {
    const { sut, sessionHandler } = makeSut();
    jest.spyOn(sessionHandler, 'verifySession').mockReturnValueOnce({
      id: '',
      email: 'valid_email',
    });

    const promise = sut.execute({ session: 'any_session' });

    await expect(promise).rejects.toThrowError(DomainError.InvalidUser);
  });

  it('Should throw DomainError.InvalidUser if payload.email is empty', async () => {
    const { sut, sessionHandler } = makeSut();
    jest.spyOn(sessionHandler, 'verifySession').mockReturnValueOnce({
      id: 'valid_id',
      email: '',
    });

    const promise = sut.execute({ session: 'any_session' });

    await expect(promise).rejects.toThrowError(DomainError.InvalidUser);
  });

  it('Should throw DomainError.InvalidUser if session unmatch with storage session', async () => {
    const { sut, userRepository } = makeSut();
    jest.spyOn(userRepository, 'findOneById').mockResolvedValueOnce(
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
    const { sut, userRepository } = makeSut();
    jest.spyOn(userRepository, 'findOneById').mockResolvedValueOnce(null);

    const promise = sut.execute({ session: 'any_session' });

    await expect(promise).rejects.toThrowError(DomainError.InvalidUser);
  });

  it('Should return UserEntity on operation success', async () => {
    const { sut } = makeSut();

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
