export abstract class DomainEvent {
  public readonly timestamp = new Date();
  public static readonly name: string;
}
