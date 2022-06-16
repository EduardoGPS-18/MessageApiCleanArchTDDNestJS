export class DomainError {
  static Unexpected = class Unexpected extends Error {};

  static CreateUserError = class CreateUserError extends Error {};
  static InvalidCredentials = class InvalidCredentials extends Error {};
  static CredentialsAlreadyInUse = class CredentialsAlreadyInUse extends Error {};
}
