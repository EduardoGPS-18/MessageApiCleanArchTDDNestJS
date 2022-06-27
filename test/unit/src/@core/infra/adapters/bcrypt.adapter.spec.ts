import { BcryptAdapter } from '@infra/adapters';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('Bcrypt || Adapter || Suit', () => {
  it('Should call integrate with bcrypt.hash correctly', async () => {
    const sut = new BcryptAdapter();
    jest.spyOn(bcrypt, 'hash').mockImplementationOnce(async () => 'any_hash');

    const hash = await sut.hash('any_value');

    expect(bcrypt.hash).toHaveBeenCalledWith('any_value', 12);
    expect(hash).toBe('any_hash');
  });

  it('Should call integrate with bcrypt.compare correctly', async () => {
    const sut = new BcryptAdapter();
    jest.spyOn(bcrypt, 'compare').mockImplementationOnce(async () => true);

    const result = await sut.compare({ value: 'value', hash: 'hash' });

    expect(bcrypt.compare).toHaveBeenCalledWith('value', 'hash');
    expect(result).toBe(true);
  });
});
