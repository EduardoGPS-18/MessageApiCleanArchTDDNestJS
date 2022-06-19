import { LessUserDataDto } from './less-user-data.dto';

export class MessageOfGroupDto {
  id: string;
  content: string;
  sender: LessUserDataDto;
  sendDate: Date;
}
