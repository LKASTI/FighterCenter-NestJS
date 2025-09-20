import { Column, Entity, PrimaryColumn } from "typeorm";

export interface TournamentPerformance {
    tournamentId: number;
    tournamentName: string;
    dates: string[];
    placement: number;
    seed: number;
    charactersUsed: string[];
    gamePatch: string;
    gameSeason: string;
}

@Entity('player_series_performance_agg')
export class PlayerSeriesPerformanceAgg {
    @PrimaryColumn({ name: "player_id" })
    playerID: number;

    @PrimaryColumn({ name: "event_id" })
    eventID: number;

    @Column("varchar", { name: "player_name"})
    playerName: string;

    @Column("integer", { name: "attendance" })
    attendance: number;

    @Column("jsonb", { name: "placement_to_count" })
    placementToCount: Record<string, number>; // {"1": 2, "3": 1, "5": 3}

    @Column("integer", { name: "best_placement"})
    bestPlacement: number;

    @Column("integer", { name: "best_placement_count"})
    bestPlacementCount: number;

    @Column("varchar", { name: "characters_used", array: true })
    charactersUsed: string[];

    @Column("jsonb", { name: "tournaments" })
    tournaments?: TournamentPerformance[];

    @Column("varchar", { name: "country"})
    country: string;

    // Last Updated date
    @Column("timestamp", { name: "updated_at" })
    updatedAt: Date;
}
