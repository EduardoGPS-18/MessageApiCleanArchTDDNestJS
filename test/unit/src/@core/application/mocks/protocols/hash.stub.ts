import { Hasher } from '@application/protocols';

export class HasherStub implements Hasher {
  hash: (value: string) => Promise<string> = jest.fn();
}
