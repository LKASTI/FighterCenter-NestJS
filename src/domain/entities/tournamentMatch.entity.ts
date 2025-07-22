import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Player } from "./player.entity";
import { Tournament } from "./tournament.entity";
import { TournamentSet } from "./tournamentSet.entity";

@Entity("tournament_match")
export class TournamentMatch {
    /* Attributes */
    @PrimaryGeneratedColumn({ name: "tournament_match_id", type: "integer" })
    tournamentMatchID: number;

    @Column("integer", { name: "tournament_set_id" })
    tournamentSetID: number;

    @Column("varchar", { name: "player_one_character", length: 30 })
    playerOneCharacter: string;

    @Column("varchar", { name: "player_two_character", length: 30 })
    playerTwoCharacter: string;

    @Column("varchar", { name: "winner_name", length: 50 })
    winnerName: string;

    @Column("integer", { name: "match_number" })
    matchNumber: number;

    /* Relationships */
    @ManyToOne(
        () => TournamentSet,
        (tournamentSet) => tournamentSet.tournamentMatches,
        {
            nullable: false,
            onDelete: "CASCADE",
        },
    )
    @JoinColumn({ name: "tournament_set_id" })
    tournamentSet: TournamentSet;
}
