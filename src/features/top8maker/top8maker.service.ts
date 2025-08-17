import { Injectable } from "@nestjs/common";
import { StartggApiService } from "../startggApi/startggApi.service";
import { Top8MakerDataResponse, Top8MakerPlayer } from "./top8maker.dto";


@Injectable()
export class Top8MakerService {
    constructor(
        private readonly startggApiService: StartggApiService
    ) {}

    public async getTop8Data(slug: string): Promise<Top8MakerDataResponse | null> {
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

        const players: Top8MakerPlayer[] = [];

        unfilteredTop8Data.standings.nodes.forEach(playerNode => {
            const player: Top8MakerPlayer = new Top8MakerPlayer();
            player.name = playerNode.entrant?.participants[0]?.gamerTag || '';
            player.placement = playerNode.placement;
            player.country = playerNode.entrant?.participants[0]?.user?.location?.country || '';
            player.twitter = playerNode.entrant?.participants[0]?.user?.authorizations?.find(a => a.type === 'TWITTER')?.externalUsername || '';

            const characterToCount: Record<string, number> = {};
            const entrantId = playerNode.entrant?.id;
            const sets = playerNode.entrant?.paginatedSets?.nodes || [];

            sets.forEach(setNode => {
                const games = setNode.games && setNode.games.length > 0 ? setNode.games : [];
                games.forEach(game => {
                    const selections = game.selections || [];
                    selections.forEach(selection => {
                        if(selection.entrant?.id === entrantId && selection.character) {
                            const charName = selection.character.name;
                            if(characterToCount[charName]) {
                                characterToCount[charName]++;
                            } else {
                                characterToCount[charName] = 1;
                            }
                        }
                    });
                })
            });

            const sortedCharacters = Object.entries(characterToCount).sort((a,b) => b[1] - a[1]).map((pair) => pair[0]);
            player.primaryCharacter = sortedCharacters.at(0) || '';
            player.secondaryCharacter = sortedCharacters.at(1) || '';

            players.push(player);
        });

        const response: Top8MakerDataResponse = new Top8MakerDataResponse();
        response.tournamentName = event.tournament?.name || '';
        response.numEntrants = event.numEntrants || 0;
        response.players = players;

        return response;
    }
}