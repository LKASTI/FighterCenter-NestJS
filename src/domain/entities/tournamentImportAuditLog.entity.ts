import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from "typeorm";

@Entity("tournament_import_audit_log")
export class TournamentImportAuditLog {
    /* Attributes */
    @PrimaryGeneratedColumn({ name: "id", type: "integer" })
    id: number;

    @Column("integer", { name: "tournament_series_id" })
    tournamentSeriesId: number;

    @Column({
        type: "enum",
        enum: ["success", "failed", "rolled_back"],
        name: "status",
    })
    status: "success" | "failed" | "rolled_back";

    @Column("text", { name: "error_message", nullable: true })
    errorMessage: string;

    @Column("text", { name: "error_stack", nullable: true })
    errorStack: string;

    @Column("jsonb", { name: "created_entities" })
    createdEntities: {
        eventId?: number;
        eventWasCreated: boolean;
        tournamentId?: number;
        playerCount: number;
        ptrCount: number;
        setCount: number;
        matchCount: number;
    };

    @CreateDateColumn({ name: "start_time", type: "timestamp" })
    startTime: Date;

    @Column({ name: "end_time", type: "timestamp", nullable: true })
    endTime: Date;

    @Column({ name: "duration_ms", type: "integer", nullable: true })
    durationMs: number;
}
