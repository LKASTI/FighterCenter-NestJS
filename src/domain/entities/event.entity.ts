import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Tournament } from "./tournament.entity";

@Entity("event")
export class Event {
    /* Attributes */
    @PrimaryGeneratedColumn({ name: "event_id", type: "integer" })
    eventID: number;

    @Column("varchar", { name: "event_name", length: 300, nullable: false })
    eventName: string;

    @Column("date", { name: "dates", array: true })
    dates: Date[];

    @Column("varchar", { name: "region", length: 100 })
    region: string;

    @Column("boolean", { name: "is_tournament_series" })
    isTournamentSeries: boolean;

    @Column("varchar", { name: "tournament_series_logo_image", length: 500 })
    tournamentSeriesLogoImage: string;

    @Column("varchar", { name: "tournament_series_banner_image", length: 500 })
    tournamentSeriesBannerImage: string;

    // Last Updated Tournament Date (added/deleted a tournament)
    @Column("timestamp", { name: "last_updated_tournament_date"})
    lastUpdatedTournamentDate: Date;

    // user_id that added/deleted a tournament
    @Column("uuid", { name: "updated_by"})
    updatedBy: string;

    /* Relationships */
    // One event could host many tournaments
    @OneToMany(() => Tournament, (tournament) => tournament.event)
    tournaments: Tournament[];
}
