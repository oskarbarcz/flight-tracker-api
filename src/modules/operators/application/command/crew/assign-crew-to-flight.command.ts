import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OperatorsRepository } from '../../../infra/database/repository/operators.repository';
import { CrewRepository } from '../../../infra/database/repository/crew.repository';
import { OperatorNotFoundError } from '../../../model/error/operator.error';
import { CrewRole } from '../../../model/crew.model';

export type CrewMember = {
  role: CrewRole;
  name: string;
};

export class AssignCrewToFlightCommand {
  constructor(
    public readonly flightId: string,
    public readonly operatorId: string,
    public readonly members: CrewMember[],
  ) {}
}

@CommandHandler(AssignCrewToFlightCommand)
export class AssignCrewToFlightHandler implements ICommandHandler<AssignCrewToFlightCommand> {
  constructor(
    private readonly crewRepository: CrewRepository,
    private readonly operatorsRepository: OperatorsRepository,
  ) {}

  async execute(command: AssignCrewToFlightCommand): Promise<void> {
    const { operatorId, members } = command;

    const operator = await this.operatorsRepository.findOneBy({
      id: operatorId,
    });

    if (!operator) {
      throw new OperatorNotFoundError();
    }

    const emailDomain = this.toEmailDomain(operator.shortName);

    for (const member of members) {
      const name = this.toTitleCase(member.name);
      const email = this.toEmail(name, emailDomain);

      await this.crewRepository.upsert({
        operatorId,
        role: member.role,
        name,
        email,
      });
    }
  }

  private toTitleCase(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
      .join(' ');
  }

  private toEmail(name: string, emailDomain: string): string {
    const tokens = name.toLowerCase().split(/\s+/);
    const first = tokens[0];
    const last = tokens[tokens.length - 1];

    return `${first}.${last}@${emailDomain}.com`;
  }

  private toEmailDomain(shortName: string): string {
    return shortName.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
}
