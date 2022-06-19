import { LessUserDataDto } from './less-user-data.dto';

export class MessageDto {
  id: string;
  content: string;
  groupId: string;
  sendDate: Date;
  sender: LessUserDataDto;
}
