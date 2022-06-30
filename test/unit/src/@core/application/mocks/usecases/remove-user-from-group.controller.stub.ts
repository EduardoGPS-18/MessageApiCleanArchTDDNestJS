import {
  RemoveUserFromGroupProps,
  RemoveUserFromGroupUseCaseI,
} from '@application/usecases';
import { GroupEntity } from '@domain/entities';

export class RemoveUserFromGroupUseCaseStub
  implements RemoveUserFromGroupUseCaseI
{
  execute: (props: RemoveUserFromGroupProps) => Promise<GroupEntity> =
    jest.fn();
}
