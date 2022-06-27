import { Encrypter, EncryptProps } from '@application/protocols';

export class EncrypterStub implements Encrypter {
  compare: (props: EncryptProps) => Promise<boolean> = jest.fn();
}
