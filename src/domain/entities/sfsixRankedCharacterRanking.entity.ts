import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryColumn,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Player } from "./player.entity";
import { Tournament } from "./tournament.entity";
import { SFSixRankedCharacter } from "./sfsixRankedCharacter.entity";

@Entity("sf6_ranked_character_ranking")
export class SFSixRankedCharacterRanking {
    /* Attributes */
    @PrimaryGeneratedColumn({
        name: "sf6_ranked_character_ranking_id",
        type: "integer",
    })
    sfsixRankedCharacterRankingID: number;

    @Column("varchar", { name: "league", length: 30 })
    league: string;

    @Column("integer", { name: "phase" })
    phase: number;

    @Column("integer", { name: "season" })
    season: number;

    @Column("integer", { name: "master_rating" })
    masterRating: number;

    @Column("integer", { name: "rank" })
    rank: number;

    @Column("date", {
        name: "date",
        transformer: {
            to: (value: Date): string => {
                console.log("Transforming date to string:", value);
                return value.toISOString().split("T")[0]; // Returns YYYY-MM-DD
            },
            from: (value: string): Date => {
                console.log("Transforming string to date:", value);
                return new Date(value); //TODO new Date auto converts to UTC
            },
        },
    })
    date: Date;

    @Column("integer", { name: "sf6_ranked_character_id" })
    sfsixRankedCharacterID: number;

    /* Relationships */
    @ManyToOne(
        () => SFSixRankedCharacter,
        (rankedChar) => rankedChar.sfsixRankedCharacterRankings,
    )
    @JoinColumn({ name: "sf6_ranked_character_id" })
    sfsixRankedCharacter: SFSixRankedCharacter;
}
