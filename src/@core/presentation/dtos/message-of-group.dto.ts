import { LessUserDataDto } from '@presentation/dtos';

export class MessageOfGroupDto {
  id: string;
  content: string;
  sender: LessUserDataDto;
  sendDate: Date;
}
