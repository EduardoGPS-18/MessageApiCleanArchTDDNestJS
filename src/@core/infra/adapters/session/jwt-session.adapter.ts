import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Payload, SessionHandler } from 'src/@core/application/protocols';

export class JwtSessionHandlerAdapter implements SessionHandler {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateSession(payload: Payload): string {
    return this.jwtService.sign(payload, {
      expiresIn: '10 d',
      secret: this.configService.get('JWT_SECRET'),
    });
  }
}
