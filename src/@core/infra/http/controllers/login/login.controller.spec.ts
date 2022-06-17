import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { LoginController } from '.';
import {
  LoginUserProps,
  LoginUserUseCaseI,
} from '../../../../application/usecases';
import { UserEntity } from '../../../../domain/entities';
import { DomainError } from '../../../../domain/errors/domain.error';

class LoginUserUseCaseStub implements LoginUserUseCaseI {
  execute({ email, rawPassword }: LoginUserProps): Promise<UserEntity> {
    return Promise.resolve({
      id: 'any_id',
      name: 'any_name',
      email: 'any_email',
      createdAt: new Date(),
      updatedAt: new Date(),
      password: 'any_password',
    });
  }
}

type SutTypes = {
  sut: LoginController;
  loginUseCaseStub: LoginUserUseCaseI;
};
const makeSut = (): SutTypes => {
  const loginUseCaseStub = new LoginUserUseCaseStub();
  const sut = new LoginController(loginUseCaseStub);
  return { sut, loginUseCaseStub };
};

describe('Login Controller', () => {
  it('Should call login usecase correctly', async () => {
    const { sut, loginUseCaseStub } = makeSut();
    jest.spyOn(loginUseCaseStub, 'execute');
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
    const { sut, loginUseCaseStub } = makeSut();
    jest.spyOn(loginUseCaseStub, 'execute');

    const user = await sut.handle({
      email: 'any_email',
      password: 'any_password',
    });

    expect(user).toEqual({
      id: 'any_id',
      name: 'any_name',
      email: 'any_email',
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
