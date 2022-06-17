import * as bcrypt from 'bcrypt';
import {
  Encrypter,
  EncryptProps,
  Hasher,
} from 'src/@core/application/protocols';

export class BcryptAdapter implements Encrypter, Hasher {
  async hash(value: string): Promise<string> {
    return await bcrypt.hash(value, 12);
  }

  compare(props: EncryptProps): Promise<boolean> {
    return bcrypt.compare(props.value, props.hash);
  }
}
