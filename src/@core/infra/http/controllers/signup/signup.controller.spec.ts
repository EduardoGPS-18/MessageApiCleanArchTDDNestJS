import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SignupController } from '.';
import {
  AddUserProps,
  AddUserUseCaseI,
} from '../../../../application/usecases';
import { UserEntity } from '../../../../domain/entities';
import { DomainError } from '../../../../domain/errors/domain.error';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

class AddUserUsecaseStub implements AddUserUseCaseI {
  async execute(props: AddUserProps): Promise<UserEntity> {
    return {
      id: 'any_id',
      name: 'any_name',
      password: 'any_password',
      email: 'any_email',
      session: 'any_session',
      updatedAt: new Date(),
      createdAt: new Date(),
      updateSession: jest.fn(),
    };
  }
}
type SutTypes = {
  sut: SignupController;
  addUserUsecaseStub: AddUserUsecaseStub;
};

const makeSut = (): SutTypes => {
  const addUserUsecaseStub = new AddUserUsecaseStub();
  const sut = new SignupController(addUserUsecaseStub);
  return { sut, addUserUsecaseStub };
};

describe('Signup Controller', () => {
  it('Should call usecase correctly', async () => {
    const { sut, addUserUsecaseStub } = makeSut();
    jest.spyOn(addUserUsecaseStub, 'execute');

    await sut.handle({
      email: 'any_email',
      name: 'any_name',
      password: 'any_password',
    });

    expect(addUserUsecaseStub.execute).toHaveBeenCalledWith({
      email: 'any_email',
      name: 'any_name',
      rawPassword: 'any_password',
    });
  });

  it('Should throw BadRequest on CredentialsAlreadyInUser', async () => {
    const { sut, addUserUsecaseStub } = makeSut();
    jest
      .spyOn(addUserUsecaseStub, 'execute')
      .mockRejectedValueOnce(new DomainError.CredentialsAlreadyInUse());

    const promise = sut.handle({
      email: 'any_email',
      name: 'any_name',
      password: 'any_password',
    });

    await expect(promise).rejects.toThrow(BadRequestException);
  });

  it('Should throw InternalServerError on UnexpectedError', async () => {
    const { sut, addUserUsecaseStub } = makeSut();
    jest
      .spyOn(addUserUsecaseStub, 'execute')
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
