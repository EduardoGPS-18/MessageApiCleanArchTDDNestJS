import {
  SendMessageToGroupProps,
  SendMessageToGroupUseCaseI,
} from '@application/usecases';
import { MessageEntity } from '@domain/entities';

export class SendMessageToGroupUseCaseStub
  implements SendMessageToGroupUseCaseI
{
  execute: (props: SendMessageToGroupProps) => Promise<MessageEntity> =
    jest.fn();
}
