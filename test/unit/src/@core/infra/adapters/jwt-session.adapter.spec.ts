import { JwtSessionHandlerAdapter } from '@infra/adapters';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

const payloadMock = { id: 'any_id', email: 'any_email' };

type SutTypes = {
  sut: JwtSessionHandlerAdapter;
  configService: ConfigService;
  jwtService: JwtService;
};
const makeSut = (): SutTypes => {
  const jwtService = new JwtService({ secret: 'any_secret' });
  const configService = new ConfigService();
  const sut = new JwtSessionHandlerAdapter(jwtService, configService);
  return { sut, configService, jwtService };
};

describe('JwtSession || Adapter || Suit', () => {
  describe('Generate session', () => {
    it('Should call correct dependencies', () => {
      const { sut, jwtService, configService } = makeSut();
      jest.spyOn(jwtService, 'sign');
      jest.spyOn(configService, 'get').mockReturnValueOnce('any_key');

      sut.generateSession(payloadMock);

      expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
      expect(jwtService.sign).toHaveBeenCalledWith(payloadMock, {
        expiresIn: '10 d',
        secret: 'any_key',
      });
    });

    it('Should return same of jwtService', () => {
      const { sut, jwtService } = makeSut();
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce('any_token');

      const token = sut.generateSession(payloadMock);

      expect(token).toBe('any_token');
    });
  });

  describe('Verify session', () => {
    it('Should call correct dependencies', () => {
      const { sut, jwtService, configService } = makeSut();
      jest.spyOn(jwtService, 'verify').mockReturnValueOnce({
        id: 'any_id',
        email: 'any_email',
      });
      jest.spyOn(configService, 'get').mockReturnValueOnce('any_key');

      sut.verifySession('any_session');

      expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
      expect(jwtService.verify).toHaveBeenCalledWith('any_session', 'any_key');
    });

    it('Should return same of jwtService', () => {
      const { sut, jwtService } = makeSut();
      jest.spyOn(jwtService, 'verify').mockReturnValueOnce(payloadMock);

      const payload = sut.verifySession('any_session');

      expect(payload).toBe(payloadMock);
    });
  });
});
