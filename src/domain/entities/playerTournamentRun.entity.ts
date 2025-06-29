import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Player } from './player.entity';
import { Tournament } from './tournament.entity';
import { TournamentSet } from './tournamentSet.entity';

@Entity('player_tournament_run')
export class PlayerTournamentRun {
  /* Attributes */
  @PrimaryColumn({ name: 'player_id', type: 'integer'})
  playerID: number;

  @PrimaryColumn({ name: 'tournament_id', type: 'integer' })
  tournamentID: number;

  @Column('varchar', { name: 'player_entry_name', length: 50, nullable: false })
  playerEntryName: string;

  @Column('varchar', { name: 'characters_used', length: 50, array: true })
  charactersUsed: string[];

  @Column('integer', { name: 'placement' })
  placement: number;

  @Column('integer', { name: 'seed' })
  seed: number;

  /* Relationships */
  @ManyToOne(() => Player, (player) => player.playerTournamentRuns, {
    nullable: false, //TODO: might need to remove
    onDelete: 'CASCADE', //TODO: might need to remove
  })
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @ManyToOne(
    () => Tournament,
    (tournament) => tournament.playerTournamentRuns,
    {
      nullable: false, //TODO: might need to remove
      onDelete: 'CASCADE', //TODO: might need to remove
    },
  )
  @JoinColumn({ name: 'tournament_id' })
  tournament: Tournament;

  @OneToMany(() => TournamentSet, (tournamentSet) => tournamentSet.playerOne)
  setsAsPlayerOne: TournamentSet[];

  @OneToMany(() => TournamentSet, (tournamentSet) => tournamentSet.playerTwo)
  setsAsPlayerTwo: TournamentSet[];
}
