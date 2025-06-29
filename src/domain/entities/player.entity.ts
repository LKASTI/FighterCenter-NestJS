import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlayerTournamentRun } from './playerTournamentRun.entity';
import { SFSixRankedProfile } from './sfsixRankedProfile.entity';

@Entity('player')
export class Player {
  /* Attributes */
  @PrimaryGeneratedColumn({ name: 'player_id', type: 'integer' })
  playerID: number;

  @Column('varchar', { name: 'player_name', length: 100, nullable: false })
  playerName: string;

  @Column('varchar', { name: 'country', length: 100 })
  country: string;

  @Column('integer', { name: 'startgg_player_id', nullable: true })
  startggPlayerID: number;

  @Column('varchar', { name: 'startgg_profile_image_url', length: 500 })
  startggProfileImageURL: string;

  /* Relationships */
  @OneToMany(
    () => PlayerTournamentRun,
    (playerTournamentRun) => playerTournamentRun.player,
  )
  playerTournamentRuns: PlayerTournamentRun[];

  @OneToMany(() => SFSixRankedProfile, (rankedProfile) => rankedProfile.player)
  sfsixRankedProfiles: SFSixRankedProfile[];
}
