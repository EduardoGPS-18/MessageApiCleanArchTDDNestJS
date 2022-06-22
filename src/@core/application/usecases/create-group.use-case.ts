import { GroupEntity, MessageEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import { GroupRepository, UserRepository } from '@domain/repositories';
import * as crypto from 'crypto';

export type CreateGroupUseCaseProps = {
  name: string;
  description: string;
  ownerId: string;
  usersIds: string[];
};

export abstract class CreateGroupUseCaseI {
  abstract execute(
    createGroupUsecaseProps: CreateGroupUseCaseProps,
  ): Promise<GroupEntity>;
}

export class CreateGroupUseCase implements CreateGroupUseCaseI {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    createGroupUsecaseProps: CreateGroupUseCaseProps,
  ): Promise<GroupEntity> {
    try {
      const { name, description, ownerId, usersIds } = createGroupUsecaseProps;
      const id = crypto.randomUUID();
      const owner = await this.userRepository.findOneById(ownerId);
      if (!owner) {
        throw new DomainError.MissingGroupOwner();
      }
      const users = await this.userRepository.findUserListByIdList(usersIds);
      const messages: MessageEntity[] = [];
      const group = GroupEntity.create({
        id,
        name,
        description,
        owner,
        users,
        messages,
      });
      await this.groupRepository.insert(group);

      return group;
    } catch (err) {
      if (err instanceof DomainError.MissingGroupOwner) {
        throw err;
      }
      throw new DomainError.Unexpected();
    }
  }
}
