import {
  AddUserToGroupProps,
  AddUserToGroupUseCaseI,
} from '@application/usecases';
import { GroupEntity } from '@domain/entities';

export class AddUserToGroupUseCaseStub implements AddUserToGroupUseCaseI {
  execute: (props: AddUserToGroupProps) => Promise<GroupEntity> = jest.fn();
}
