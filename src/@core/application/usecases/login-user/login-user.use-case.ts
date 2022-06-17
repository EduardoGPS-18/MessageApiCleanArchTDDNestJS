import { UserEntity } from 'src/@core/domain/entities';
import { DomainError } from '../../../../@core/domain/errors/domain.error';
import { UserRepository } from '../../../../@core/domain/repositories';
import { Encrypter } from '../../protocols';

export type LoginUserProps = {
  email: string;
  rawPassword: string;
};

export abstract class LoginUserUseCaseI {
  abstract execute({ email, rawPassword }: LoginUserProps): Promise<UserEntity>;
}

export class LoginUserUseCase implements LoginUserUseCaseI {
  constructor(
    private encrypter: Encrypter,
    private userRepository: UserRepository,
  ) {}

  async execute({ email, rawPassword }: LoginUserProps): Promise<UserEntity> {
    try {
      const user = await this.userRepository.findOneByEmail(email);
      if (!user) {
        throw new DomainError.InvalidCredentials();
      }
      const isValid = await this.encrypter.compare({
        value: rawPassword,
        hash: user.password,
      });
      if (!isValid) {
        throw new DomainError.InvalidCredentials();
      }
      return user;
    } catch (err) {
      if (err instanceof DomainError.InvalidCredentials) {
        throw err;
      }
      throw new DomainError.Unexpected();
    }
  }
}
