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
import { SFSixRankedCharacter } from './sfsixRankedCharacter.entity';

@Entity('sf6_ranked_profile')
export class SFSixRankedProfile {
  /* Attributes */
  @PrimaryColumn({ name: 'usercode' })
  usercode: number;

  @Column('varchar', { name: 'cfn', length: 100, nullable: false })
  cfn: string;

  @Column('varchar', { name: 'flag', length: 100 })
  flag: string;

  @Column('integer', { name: 'player_id', nullable: true })
  playerID: number;

  /* Relationships */
  @ManyToOne(() => Player, (player) => player.sfsixRankedProfiles)
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @OneToMany(
    () => SFSixRankedCharacter,
    (rankedCharacter) => rankedCharacter.sfsixRankedProfile,
  )
  sfsixRankedCharacters: SFSixRankedCharacter[];
}
