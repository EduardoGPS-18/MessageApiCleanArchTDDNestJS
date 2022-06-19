export class DomainError {
  static Unexpected = class Unexpected extends Error {};

  static InvalidUser = class InvalidUser extends Error {};
  static InvalidCredentials = class InvalidCredentials extends Error {};
  static CredentialsAlreadyInUse = class CredentialsAlreadyInUse extends Error {};

  static MissingGroupOwner = class MissingGroupOwner extends Error {};
  static UserIsntInGroup = class UserIsntInGroup extends Error {};
  static InvalidGroup = class InvalidGroup extends Error {};

  static InvalidMessage = class InvalidGroup extends Error {};
}
