import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    Unique,
} from "typeorm";
import { SFSixRankedProfile } from "./sfsixRankedProfile.entity";
import { SFSixRankedCharacterRanking } from "./sfsixRankedCharacterRanking.entity";

@Entity("sf6_ranked_character")
@Unique("UQ_ranked_character_usercode_character", ["usercode", "characterName"])
@Index("IDX_ranked_character_usercode_character", ["usercode", "characterName"])
export class SFSixRankedCharacter {
    /* Attributes */
    @PrimaryGeneratedColumn({
        name: "sf6_ranked_character_id",
        type: "integer",
    })
    sfsixRankedCharacterID: number;

    @Column("varchar", { name: "character_name", length: 100 })
    characterName: string;

    @Column("integer", { name: "usercode" })
    usercode: number;

    /* Relationships */
    @ManyToOne(
        () => SFSixRankedProfile,
        (rankedProfile) => rankedProfile.sfsixRankedCharacters,
    )
    @JoinColumn({ name: "usercode" })
    sfsixRankedProfile: SFSixRankedProfile;

    @OneToMany(
        () => SFSixRankedCharacterRanking,
        (characterRanking) => characterRanking.sfsixRankedCharacter,
    )
    sfsixRankedCharacterRankings: SFSixRankedCharacterRanking[];
}
