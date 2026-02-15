import {
    Entity,
    PrimaryColumn,
    Column,
    UpdateDateColumn,
} from "typeorm";

@Entity("sf6_buckler_config")
export class SF6BucklerConfig {
    @PrimaryColumn("integer", { name: "id", default: 1 })
    id: number;

    @Column("boolean", { name: "enabled", default: false })
    enabled: boolean;

    @Column("varchar", { name: "buckler_id", length: 255, nullable: true })
    bucklerId: string | null;

    @Column("varchar", { name: "buckler_r_id", length: 255, nullable: true })
    bucklerRId: string | null;

    @Column("varchar", { name: "buckler_praise_date", length: 255, nullable: true })
    bucklerPraiseDate: string | null;

    @Column("integer", { name: "phase", nullable: true })
    phase: number | null;

    @Column("integer", { name: "season", nullable: true })
    season: number | null;

    @Column("varchar", { name: "discord_webhook_url", length: 512, nullable: true })
    discordWebhookUrl: string | null;

    @Column("date", { name: "phase_start_date", nullable: true })
    phaseStartDate: Date | null;

    @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
    updatedAt: Date;
}
