import {
  GetGroupMessageListUseCaseI,
  GetGroupMessageProps,
} from '@application/usecases';
import { MessageEntity } from '@domain/entities';

export class GetGroupMessageListUseCaseStub
  implements GetGroupMessageListUseCaseI
{
  execute: ({ groupId }: GetGroupMessageProps) => Promise<MessageEntity[]> =
    jest.fn();
}
