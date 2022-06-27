import {
  CreateGroupUseCaseI,
  CreateGroupUseCaseProps,
} from '@application/usecases';
import { GroupEntity } from '@domain/entities';

export class CreateGroupUseCaseStub implements CreateGroupUseCaseI {
  execute: (
    createGroupUsecaseProps: CreateGroupUseCaseProps,
  ) => Promise<GroupEntity> = jest.fn();
}
