import { BeforeInsert, Column, Entity, PrimaryColumn } from "typeorm";
import { v4 as uuid } from "uuid";

@Entity("startgg_user")
export class StartggUser {
    @PrimaryColumn("uuid", { name: "startgg_user_id" })
    startggUserID: string;

    @BeforeInsert()
    generateIds() {
        this.startggUserID = uuid();
        this.updatedAt = new Date();
    }

    @Column("varchar", { name: "startgg_id" })
    startggId: string;

    @Column("varchar", { name: "startgg_encrypted_token" })
    startggEncryptedToken: string;

    @Column("varchar", { name: "startgg_encrypted_refresh_token" })
    startggEncryptedRefreshToken: string;

    @Column("varchar", { name: "startgg_token_expire_date" })
    startggTokenExpireDate: Date;

    @Column("varchar", { name: "startgg_username", length: 100 })
    startggUsername: string;

    @Column("varchar", { name: "startgg_gamer_tag", length: 100 })
    startggGamerTag: string;

    @Column("varchar", { name: "roles", length: 100, array: true })
    roles: string[];

    @Column("varchar", {
        name: "tournament_series_assigned",
        length: 100,
        array: true,
    })
    tournamentSeriesAssigned: string[];

    @Column("timestamp", { name: "created_at" })
    createdAt: Date;

    @Column("timestamp", { name: "updated_at" })
    updatedAt: Date;
}
