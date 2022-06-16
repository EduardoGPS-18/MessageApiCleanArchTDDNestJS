export class DomainError {
  static CreateUserError = class CreateUserError extends Error {};
  static CredentialsAlreadyInUse = class CredentialsAlreadyInUse extends Error {};
}
