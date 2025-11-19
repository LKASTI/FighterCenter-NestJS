import { InjectRepository } from "@nestjs/typeorm";
import { Tournament } from "@domain/entities/tournament.entity";
import { Event } from "@domain/entities/event.entity";
import { Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common/exceptions/not-found.exception";
import { CreateTournamentDto } from "../dtos/request/create-tournament.dto";
import { FindTournamentsQueryDto } from "../dtos/request/find-tournaments-query.dto";

export class TournamentRepository extends Repository<Tournament> {
    constructor(
        @InjectRepository(Tournament)
        private repository: Repository<Tournament>,
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }

    public async createAndSave(
        tournament: CreateTournamentDto,
    ): Promise<Tournament> {
        const event = await this.manager
            .getRepository(Event)
            .findOneBy({ eventID: tournament.eventID });

        if (!event)
            throw new NotFoundException(
                `Event with eventID ${tournament.eventID} not found`,
            );

        const newTournament = this.create({
            event: event,
            ...tournament,
        });

        return await this.save(newTournament);
    }

    public async findAllGamePatchesByEventId(eventID: number) {
        const data = await this.query(
            `
                SELECT DISTINCT ON(t.game_patch) t.game_patch
                FROM tournament AS t
                WHERE t.event_id = $1
                  AND t.game_patch IS NOT NULL;
			`,
            [eventID],
        );

        return {
            data: data ? data.map((o) => o["game_patch"]) : [],
            meta: {
                total: data.length,
            },
        };
    }

    public async findAll(query: FindTournamentsQueryDto) {
        const queryBuilder = this.createQueryBuilder("tournament");

        // Apply filters if provided
        if (query.tournamentID) {
            queryBuilder.andWhere(
                "tournament.tournamentID = :tournamentID",
                {
                    tournamentID: query.tournamentID,
                },
            );
        }

        if (query.tournamentName) {
            queryBuilder.andWhere(
                "tournament.tournamentName = :tournamentName",
                {
                    tournamentName: query.tournamentName,
                },
            );
        }

        if (query.tournamentRegion) {
            queryBuilder.andWhere(
                "tournament.tournamentRegion = :tournamentRegion",
                {
                    tournamentRegion: query.tournamentRegion,
                },
            );
        }

        if (query.gameName) {
            queryBuilder.andWhere("tournament.gameName = :gameName", {
                gameName: query.gameName,
            });
        }

        if (query.gamePatch) {
            queryBuilder.andWhere("tournament.gamePatch = :gamePatch", {
                gamePatch: query.gamePatch,
            });
        }

        if (query.gameSeason) {
            queryBuilder.andWhere("tournament.gameSeason = :gameSeason", {
                gameSeason: query.gameSeason,
            });
        }

        if (query.eventID) {
            queryBuilder.andWhere("tournament.eventID = :eventID", {
                eventID: query.eventID,
            });
        }

        if (query.dates) {
            for (const date of query.dates) {
                queryBuilder.andWhere(":date = ANY(tournament.dates)", {
                    date: date.toISOString(),
                });
            }
        }

        if (query.isOnline) {
            queryBuilder.andWhere("tournament.isOnline = :isOnline", {
                isOnline: query.isOnline,
            });
        }

        if (query.top8GraphicIsFile) {
            queryBuilder.andWhere(
                "tournament.top8GraphicIsFile = :top8GraphicIsFile",
                {
                    top8GraphicIsFile: query.top8GraphicIsFile,
                },
            );
        }

        if (query.tournamentType) {
            queryBuilder.andWhere(
                "tournament.tournamentType = :tournamentType",
                {
                    tournamentType: query.tournamentType,
                },
            );
        }

        if (query.vodLink) {
            queryBuilder.andWhere("tournament.vodLink = :vodLink", {
                vodLink: query.vodLink,
            });
        }

        if (query.sortBy) {
            queryBuilder.orderBy(`tournament.${query.sortBy}`, query.order);
        }

        queryBuilder.take(query.limit);

        const [tournaments, count] = await queryBuilder.getManyAndCount();

        return {
            data: tournaments,
            meta: {
                limit: query.limit,
                total: count,
            },
        };
    }
}
