import { BeforeInsert, Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { v4 as uuid } from "uuid";
import { JwtRefreshToken } from "./jwtRefreshToken.entity";

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

    @Column("bigint", {
        name: "startgg_token_expire_in",
        transformer: {
            to: (value: number) => value,
            from: (value: string) => parseInt(value, 10)
        }
    })
    startggTokenExpiresIn: number;

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

    @Column("varchar", { name: "sf6_profile_characters", array: true })
    sf6ProfileCharacters: string[];

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;

    @OneToMany(() => JwtRefreshToken, token => token.user)
    refreshTokens: JwtRefreshToken[];
}
