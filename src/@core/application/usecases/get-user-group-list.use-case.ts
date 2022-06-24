import { GroupEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import { GroupRepository, UserRepository } from '@domain/repositories';

export type GetUserGroupList = {
  userId: string;
};

export class GetUserGroupListUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly groupRepository: GroupRepository,
  ) {}

  async execute({ userId }: GetUserGroupList): Promise<GroupEntity[]> {
    try {
      const user = await this.userRepository.findOneById(userId);
      if (!user) {
        throw new DomainError.InvalidUser();
      }
      const groups = await this.groupRepository.findByUser(user);

      return groups;
    } catch (err) {
      if (err instanceof DomainError.InvalidUser) {
        throw err;
      }
      throw new DomainError.Unexpected();
    }
  }
}
