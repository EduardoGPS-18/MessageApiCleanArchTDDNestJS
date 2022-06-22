import { GroupEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import { GroupRepository, UserRepository } from '@domain/repositories';

export type AddUserToGroupProps = {
  groupId: string;
  userId: string;
  adderId: string;
};

export abstract class AddUserToGroupUseCaseI {
  abstract execute(props: AddUserToGroupProps): Promise<GroupEntity>;
}

export class AddUserToGroupUseCase implements AddUserToGroupUseCaseI {
  constructor(
    private groupRepository: GroupRepository,
    private userRepository: UserRepository,
  ) {}

  async execute(props: AddUserToGroupProps): Promise<GroupEntity> {
    try {
      const { groupId, userId, adderId } = props;
      const group = await this.groupRepository.findById(groupId);
      const toAddUser = await this.userRepository.findOneById(userId);
      const adder = await this.userRepository.findOneById(adderId);
      if (!adder) throw new DomainError.InvalidUser();
      if (!toAddUser) throw new DomainError.UserNotFound();
      if (!group.isUserAdminer(adder)) throw new DomainError.UserNotAdminer();
      if (group.isUserInGroup(toAddUser))
        throw new DomainError.UserAlreadyInGroup();
      group.addUserListOnGroup([toAddUser]);
      await this.groupRepository.update(group);
      return group;
    } catch (err) {
      if (
        err instanceof DomainError.InvalidUser ||
        err instanceof DomainError.UserNotFound ||
        err instanceof DomainError.UserNotAdminer ||
        err instanceof DomainError.UserAlreadyInGroup
      ) {
        throw err;
      }
      throw new DomainError.Unexpected();
    }
  }
}
