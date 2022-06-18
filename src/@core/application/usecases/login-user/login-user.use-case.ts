import { UserEntity } from '../../../domain/entities';
import { DomainError } from '../../../domain/errors/domain.error';
import { UserRepository } from '../../../domain/repositories';
import { Encrypter, SessionHandler } from '../../protocols';

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
    private sessionHandler: SessionHandler,
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
      const { id } = user;
      const session = this.sessionHandler.generateSession({
        id,
        email,
      });
      user.updateSession(session);
      if (!isValid) {
        throw new DomainError.InvalidCredentials();
      }
      await this.userRepository.update(user);
      return user;
    } catch (err) {
      console.log(err);
      if (err instanceof DomainError.InvalidCredentials) {
        throw err;
      }
      throw new DomainError.Unexpected();
    }
  }
}
