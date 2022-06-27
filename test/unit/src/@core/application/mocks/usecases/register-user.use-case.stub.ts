import { RegisterUserProps, RegisterUserUseCaseI } from '@application/usecases';
import { UserEntity } from '@domain/entities';

export class RegisterUserUsecaseStub implements RegisterUserUseCaseI {
  execute: (props: RegisterUserProps) => Promise<UserEntity> = jest.fn();
}
