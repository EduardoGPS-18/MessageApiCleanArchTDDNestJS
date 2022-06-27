import { ValidateUserProps, ValidateUserUseCaseI } from '@application/usecases';
import { UserEntity } from '@domain/entities';

export class ValidateUserUseCaseStub implements ValidateUserUseCaseI {
  execute: ({ session }: ValidateUserProps) => Promise<UserEntity> = jest.fn();
}
