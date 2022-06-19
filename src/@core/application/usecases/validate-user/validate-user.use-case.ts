import { UserEntity } from '../../../domain/entities/';
import { DomainError } from '../../../domain/errors/domain.error';
import { UserRepository } from '../../../domain/repositories';
import { SessionHandler } from '../../protocols';

export type ValidateUserProps = {
  session: string;
};
export abstract class ValidateUserUseCaseI {
  abstract execute(props: ValidateUserProps): Promise<UserEntity>;
}

export class ValidateUserUseCase implements ValidateUserUseCaseI {
  constructor(
    private readonly sessionHandler: SessionHandler,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(props: ValidateUserProps): Promise<UserEntity> {
    const { session } = props;
    const payload = this.sessionHandler.verifySession(session);
    if (!payload) {
      throw new DomainError.InvalidUser();
    }
    const { id, email } = payload;
    if (!id || !email) {
      throw new DomainError.InvalidUser();
    }
    const user = await this.userRepository.findOneById(payload.id);
    if (!user || user.session !== session) {
      throw new DomainError.InvalidUser();
    }
    return user;
  }
}
