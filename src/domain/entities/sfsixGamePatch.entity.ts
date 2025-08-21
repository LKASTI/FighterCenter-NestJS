import { Column, Entity } from "typeorm";

@Entity('ref_sf6_game_patch')
export class SFSixGamePatch {

    @Column("varchar", { name: "patch", length: 500})
    patch: string;

    @Column("date", {
        name: "patch_date",
        transformer: {
            to: (value: Date): string => {
                return value.toISOString().split("T")[0]; // Returns YYYY-MM-DD
            },
            from: (value: string): Date => {
                return new Date(value); // New Date auto converts to UTC
            },
        },
        primary: true
    })
    date: Date;

    @Column("varchar", { name: "patch_version", length: 100, primary: true})
    patchVersion: string;

    @Column("varchar", { name: "patch_description", length: 500})
    patchDescription: string;

    @Column("integer", { name: "patch_season"})
    patchSeason: number;
}