import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryColumn,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Tournament } from "./tournament.entity";
import { Player } from "./player.entity";
import { PlayerTournamentRun } from "./playerTournamentRun.entity";
import { TournamentMatch } from "./tournamentMatch.entity";

@Entity("tournament_set")
export class TournamentSet {
    /* Attributes */
    @PrimaryGeneratedColumn({ name: "tournament_set_id", type: "integer" })
    tournamentSetID: number;

    @Column("integer", { name: "tournament_id" })
    tournamentID: number;

    @Column("integer", { name: "player_one_id" })
    playerOneID: number;

    @Column("integer", { name: "player_two_id" })
    playerTwoID: number;

    @Column("integer", { name: "startgg_set_id" })
    startggSetID: number;

    @Column("varchar", { name: "bracket_name", length: 100 })
    bracketName: string;

    @Column("integer", { name: "matches_to_win" })
    matchesToWin: number;

    @Column("varchar", { name: "bracket_round", length: 100 })
    bracketRound: string;

    @Column("integer", { name: "winner_id" })
    winnerID: number;

    @Column("varchar", { name: "winner_name", length: 100 })
    winnerName: string;

    /* Relationships */
    @ManyToOne(() => Tournament, (tournament) => tournament.tournamentSets)
    @JoinColumn({ name: "tournament_id" })
    tournament: Tournament;

    @ManyToOne(
        () => PlayerTournamentRun,
        (playerTournamentRun) => playerTournamentRun.setsAsPlayerOne,
    )
    @JoinColumn([
        { name: "player_one_id", referencedColumnName: "playerID" },
        { name: "tournament_id", referencedColumnName: "tournamentID" },
    ])
    playerOne: PlayerTournamentRun;

    @ManyToOne(
        () => PlayerTournamentRun,
        (playerTournamentRun) => playerTournamentRun.setsAsPlayerTwo,
    )
    @JoinColumn([
        { name: "player_two_id", referencedColumnName: "playerID" },
        { name: "tournament_id", referencedColumnName: "tournamentID" },
    ])
    playerTwo: PlayerTournamentRun;

    @OneToMany(
        () => TournamentMatch,
        (tournamentMatch) => tournamentMatch.tournamentSet,
    )
    tournamentMatches: TournamentMatch[];
}
