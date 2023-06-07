import { IsNotEmpty, ValidateIf } from 'class-validator';

export class AddParticipantTeamDto {
  @ValidateIf((obj: AddParticipantTeamDto) => !obj.teamId)
  @IsNotEmpty({ message: 'teamName should not be empty' })
  readonly teamName?: string;

  @ValidateIf((obj: AddParticipantTeamDto) => !obj.teamName)
  @IsNotEmpty({ message: 'id should not be empty' })
  readonly teamId?: number;
}
