import { TwitterShare } from "@domain/entities/twitterShare.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateTwitterShareDto } from "../dtos/request/create-twitter-share.dto";


export class TwitterShareRepository extends Repository<TwitterShare> {
    constructor(
        @InjectRepository(TwitterShare)
        private repository: Repository<TwitterShare>,
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }

    public async createAndSave(twitterShare: CreateTwitterShareDto): Promise<TwitterShare> {
        const newTwitterShare = this.repository.create(twitterShare);
        return await this.save(newTwitterShare);
    }
}