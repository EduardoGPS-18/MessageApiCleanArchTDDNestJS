export type EncryptProps = {
  value: string;
  hash: string;
};
export abstract class Encrypter {
  abstract compare(props: EncryptProps): Promise<boolean>;
}
