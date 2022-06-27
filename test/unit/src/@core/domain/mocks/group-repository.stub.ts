import { GroupEntity, UserEntity } from '@domain/entities';
import { GroupRepository } from '@domain/repositories';

export class GroupRepositoryStub implements GroupRepository {
  findByUser: (user: UserEntity) => Promise<GroupEntity[]> = jest.fn();
  insert: (group: GroupEntity) => Promise<void> = jest.fn();
  update: (group: GroupEntity) => Promise<void> = jest.fn();
  findById: (id: string) => Promise<GroupEntity> = jest.fn();
}
