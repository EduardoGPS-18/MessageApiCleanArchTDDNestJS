import { EditMessageProps, EditMessageUseCaseI } from '@application/usecases';
import { MessageEntity } from '@domain/entities';

export class EditMessageUseCaseStub implements EditMessageUseCaseI {
  execute: (props: EditMessageProps) => Promise<MessageEntity> = jest.fn();
}
