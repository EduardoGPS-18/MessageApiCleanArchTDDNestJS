import { LoginUserProps, LoginUserUseCaseI } from '@application/usecases';
import { UserEntity } from '@domain/entities';

export class LoginUserUseCaseStub implements LoginUserUseCaseI {
  execute: ({ email, rawPassword }: LoginUserProps) => Promise<UserEntity> =
    jest.fn();
}
