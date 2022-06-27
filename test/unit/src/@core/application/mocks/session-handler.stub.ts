import { Payload, SessionHandler } from '@application/protocols';

export class SessionHandlerStub implements SessionHandler {
  verifySession: (session: string) => Payload = jest.fn();
  generateSession: (payload: Payload) => string = jest.fn();
}
