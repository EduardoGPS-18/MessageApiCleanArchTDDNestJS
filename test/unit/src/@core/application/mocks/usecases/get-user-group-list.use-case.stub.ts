import {
  GetUserGroupList,
  GetUserGroupListUseCaseI,
} from '@application/usecases';
import { GroupEntity } from '@domain/entities';

export class GetUserGroupListUseCaseStub implements GetUserGroupListUseCaseI {
  execute: ({ userId }: GetUserGroupList) => Promise<GroupEntity[]> = jest.fn();
}
