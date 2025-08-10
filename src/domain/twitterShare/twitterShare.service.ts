import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TwitterShareRepository } from "./twitterShare.repository";
import { CreateTwitterShareDto, UpdateTwitterShareDto } from "../../dtos/twitterShare.dto";


@Injectable()
export class TwitterShareService{
    constructor(
        @InjectRepository(TwitterShareRepository)
        private readonly repository: TwitterShareRepository
    ) {}

    public async createAndSave(twitterShare: CreateTwitterShareDto) {
        return await this.repository.createAndSave(twitterShare);
    }

    public async findById(id: string) {
        return await this.repository.findOneBy({
            twitterShareID: id
        });
    }

    public async update(id: string, updateTwitterShareDto: UpdateTwitterShareDto) {
        const twitterShare = await this.findById(id);

        if (!twitterShare) {
            return null;
        }

        await this.repository.update(
            { twitterShareID: id },
            updateTwitterShareDto
        )

        return await this.repository.findOneBy({ twitterShareID: id });
    }

    public async removeById(id: string): Promise<boolean> {
        const result = await this.repository.delete({
            twitterShareID: id
        });
        return result.affected > 0;
    }
}