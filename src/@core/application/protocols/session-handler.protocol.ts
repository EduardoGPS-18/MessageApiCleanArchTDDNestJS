export type Payload = {
  id: string;
  email: string;
};

export abstract class SessionHandler {
  abstract generateSession(payload: Payload): string;
}
