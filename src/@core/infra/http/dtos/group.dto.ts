import { LessUserDataDto } from './less-user-data.dto';

export class GroupDto {
  id: string;
  name: string;
  description: string;
  owner: LessUserDataDto;
  users: LessUserDataDto[];
}
