import {
  DeleteMessageProps,
  DeleteMessageUseCaseI,
} from '@application/usecases';

export class DeleteMessageUseCaseStub implements DeleteMessageUseCaseI {
  execute: (props: DeleteMessageProps) => Promise<void> = jest.fn();
}
