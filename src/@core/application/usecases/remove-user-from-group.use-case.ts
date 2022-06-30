import { GroupEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import { GroupRepository, UserRepository } from '@domain/repositories';

export type RemoveUserFromGroupProps = {
  toRemoveUserId: string;
  removerId: string;
  groupId: string;
};

export abstract class RemoveUserFromGroupUseCaseI {
  abstract execute(props: RemoveUserFromGroupProps): Promise<GroupEntity>;
}

export class RemoveUserFromGroupUseCase implements RemoveUserFromGroupUseCaseI {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly groupRepository: GroupRepository,
  ) {}

  async execute(props: RemoveUserFromGroupProps): Promise<GroupEntity> {
    try {
      const { groupId, removerId, toRemoveUserId } = props;
      const remover = await this.userRepository.findOneById(removerId);
      if (!remover) {
        throw new DomainError.InvalidUser();
      }
      const toRemoveUser = await this.userRepository.findOneById(
        toRemoveUserId,
      );
      if (!toRemoveUser) {
        throw new DomainError.UserNotFound();
      }
      const group = await this.groupRepository.findById(groupId);
      if (!group) {
        throw new DomainError.InvalidGroup();
      }
      if (!group.isUserAdminer(remover)) {
        throw new DomainError.UserNotAdminer();
      }
      if (!group.isUserInGroup(toRemoveUser)) {
        throw new DomainError.UserIsntInGroup();
      }
      group.removeUserListFromGroup([toRemoveUser]);

      await this.groupRepository.update(group);
      return group;
    } catch (err) {
      if (
        err instanceof DomainError.InvalidUser ||
        err instanceof DomainError.UserNotFound ||
        err instanceof DomainError.InvalidGroup ||
        err instanceof DomainError.UserNotAdminer ||
        err instanceof DomainError.UserIsntInGroup
      ) {
        throw err;
      }
      throw new DomainError.Unexpected();
    }
  }
}
