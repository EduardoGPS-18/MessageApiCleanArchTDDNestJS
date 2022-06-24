import { LessUserDataDto } from './less-user-data.dto';

export class MessageDto {
  id: string;
  content: string;
  groupId: string;
  sender: LessUserDataDto;
  sendDate: Date;
}
