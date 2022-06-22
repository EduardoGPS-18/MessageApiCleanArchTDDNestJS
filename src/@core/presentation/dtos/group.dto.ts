import { LessUserDataDto, MessageDto } from '@presentation/dtos';

export class GroupDto {
  id: string;
  name: string;
  description: string;
  messages: MessageDto[];
  owner: LessUserDataDto;
  users: LessUserDataDto[];
}

export class GroupWithoutMessagesDto {
  id: string;
  name: string;
  description: string;
  owner: LessUserDataDto;
  users: LessUserDataDto[];
}
