export abstract class Hasher {
  abstract hash(value: string): Promise<string>;
}
