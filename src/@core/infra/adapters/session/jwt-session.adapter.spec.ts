import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtSessionHandlerAdapter } from './jwt-session.adapter';

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

describe('Jwt Session adapter', () => {
  it('Should call correct dependencies', () => {
    const { sut, jwtService, configService } = makeSut();
    jest.spyOn(jwtService, 'sign');
    jest.spyOn(configService, 'get').mockReturnValueOnce('any_key');

    const payloadMock = { id: 'any_id', email: 'any_email' };
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

    const payloadMock = { id: 'any_id', email: 'any_email' };
    const token = sut.generateSession(payloadMock);

    expect(token).toBe('any_token');
  });
});
