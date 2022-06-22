import { Encrypter, EncryptProps, Hasher } from '@application/protocols';
import * as bcrypt from 'bcrypt';

export class BcryptAdapter implements Encrypter, Hasher {
  async hash(value: string): Promise<string> {
    return await bcrypt.hash(value, 12);
  }

  compare(props: EncryptProps): Promise<boolean> {
    return bcrypt.compare(props.value, props.hash);
  }
}
