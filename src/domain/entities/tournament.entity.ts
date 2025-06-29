import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Event } from './event.entity';
import { PlayerTournamentRun } from './playerTournamentRun.entity';
import { TournamentSet } from './tournamentSet.entity';

@Entity('tournament')
export class Tournament {
  /* Attributes */
  @PrimaryGeneratedColumn({ name: 'tournament_id' })
  tournamentID: number;

  @Column('varchar', { name: 'tournament_name', length: 300, nullable: false })
  tournamentName: string;

  @Column('varchar', { name: 'tournament_region', length: 100 })
  tournamentRegion: string;

  @Column('integer', { name: 'num_entrants' })
  numEntrants: number;

  @Column('date', { name: 'dates', array: true })
  dates: Date[];

  @Column('varchar', { name: 'game_name', length: 100 })
  gameName: string;

  @Column('varchar', { name: 'game_patch', length: 100 })
  gamePatch: string;

  @Column('varchar', { name: 'game_season', length: 100 })
  gameSeason: string;

  @Column('varchar', { name: 'tournament_type', length: 50 })
  tournamentType: string;

  @Column('varchar', { name: 'vod_link', length: 100 })
  vodLink: string;

  @Column('boolean', { name: 'is_online' })
  isOnline: boolean;

  @Column('boolean', { name: 'top8_graphic_is_file' })
  top8GraphicIsFile: boolean;

  @Column('varchar', { name: 'tournament_top8_graphic_image', length: 500 })
  tournamentTop8GraphicImage: string;

  @Column('integer', { name: 'event_id' })
  eventID: number;

  /* Relationships */
  // Event associated with tournament
  @ManyToOne(() => Event, (event) => event.tournaments, {
    nullable: false, //TODO: might need to remove
    onDelete: 'CASCADE', //TODO: might need to remove
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @OneToMany(
    () => PlayerTournamentRun,
    (playerTournamentRun) => playerTournamentRun.tournament,
  )
  playerTournamentRuns: PlayerTournamentRun[];

  @OneToMany(() => TournamentSet, (tournamentSet) => tournamentSet.tournament)
  tournamentSets: TournamentSet[];
}
