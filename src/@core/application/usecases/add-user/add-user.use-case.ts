import * as crypto from 'crypto';

import { UserEntity } from '../../../../@core/domain/entities';
import { DomainError } from '../../../../@core/domain/errors/domain.error';
import { UserRepository } from '../../../../@core/domain/repositories';
import { Hasher } from '../../protocols';

export type AddUserProps = {
  name: string;
  email: string;
  rawPassword: string;
};

export abstract class AddUserUseCaseI {
  abstract execute(props: AddUserProps): Promise<UserEntity>;
}

export class AddUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hasher: Hasher,
  ) {}

  async execute(props: AddUserProps): Promise<UserEntity> {
    try {
      const { name, email, rawPassword } = props;
      const userWithSameEmail = await this.userRepository.findOneByEmail(email);
      if (userWithSameEmail !== null) {
        throw new DomainError.CredentialsAlreadyInUse();
      }

      const id = crypto.randomUUID();
      const password = await this.hasher.hash(rawPassword);
      const user = UserEntity.create({ id, email, name, password });
      await this.userRepository.insert(user);
      return user;
    } catch (err) {
      if (err instanceof DomainError.CredentialsAlreadyInUse) {
        throw err;
      }
      throw new DomainError.Unexpected();
    }
  }
}
