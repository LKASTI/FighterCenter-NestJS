import { Injectable } from "@nestjs/common";
import { StartggApiService } from "../startggApi/startggApi.service";


@Injectable()
export class Top8MakerService {
    constructor(
        private readonly startggApiService: StartggApiService
    ) {}

    public async getTop8Data(slug: string) {
        // Get event
        const event = await this.startggApiService.getEvent(slug);
        if(!event || !event.id) {
            throw new Error(`Event with slug ${slug} not found`);
        }
        // Get top 8 data
        const unfilteredTop8Data = await this.startggApiService.getTop8PlayerData(event.id)
        if(!unfilteredTop8Data || !unfilteredTop8Data.standings || !unfilteredTop8Data.standings.nodes || unfilteredTop8Data.standings.nodes.length === 0) {
            throw new Error(`No Top 8 data found for event with slug ${slug} and event ID ${event.id}`);
        }


    }
}