import { BeforeInsert, Column, Entity, PrimaryColumn } from "typeorm";
import { v4 as uuid } from "uuid";

@Entity('twitter_share')
export class TwitterShare {
    @PrimaryColumn("uuid", { name: "twitter_share_id" })
    twitterShareID: string;

    @BeforeInsert()
    generateIds() {
        this.twitterShareID = uuid();
    }

    @Column("varchar", { name: "page_url" })
    pageUrl: string;

    @Column("varchar", { name: "image_url" })
    imageUrl: string;

    @Column("varchar", { name: "title" })
    title: string;

    @Column("varchar", { name: "description" })
    description: string;

    @Column("date", { name: "create_date" })
    createDate: Date;

    @Column("date", { name: "update_date" })
    updateDate: Date;
}