import { BadRequestException, Inject, Injectable, Scope } from "@nestjs/common";
import { GraphQLClient } from "graphql-request";
import { Event, QueryEventArgs, SetConnection, Tournament } from "../graphql/startgg-api.graphql";
import { GetEventQuery, GetEventTop8PlayerDataQuery, GetTournamentSetsQuery } from "../graphql/startgg-api.queries";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { StartggUser } from "@domain/entities";
import { EncryptionService } from "@authentication/encryption/encryption.service";

@Injectable({ scope: Scope.REQUEST })
export class StartggApiService {
    constructor(
        @Inject(REQUEST) private request: Request,
        private readonly encryptionService: EncryptionService
    ) {
    }

    /**
     * Get Start.gg API token from request user or fallback to environment variable
     *
     * SECURITY NOTE (Finding 20):
     * - Primary: Uses user's OAuth token (preferred, user-specific)
     *
     * Environment variable concerns:
     * - Shared key across all requests
     * - Visible in process environment
     * - Rotation requires redeployment
     * - No per-user audit trail
     *
     */
    private getTokenFromRequest(): string {
        if(this.request.user && (this.request.user as StartggUser).startggEncryptedToken) {
            return this.encryptionService.decrypt((this.request.user as StartggUser).startggEncryptedToken);
        } else {
            throw new BadRequestException();
        }
    }

    private initializeGqlClient(): GraphQLClient {
        const token = this.getTokenFromRequest();
        return new GraphQLClient('https://api.start.gg/gql/alpha', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
    }

    public async getEvent(slug: string): Promise<Event | null> {
        const client = this.initializeGqlClient();

        const query = GetEventQuery;
        const variables: QueryEventArgs = {slug};
        const response: { event: Event } = await client.request(query, variables);
        return response.event;
    }

    public async getTop8PlayerData(eventId: string) {
        const client = this.initializeGqlClient();

        const query = GetEventTop8PlayerDataQuery;
        const variables: QueryEventArgs = { id: eventId };
        const response: { event: Event } = await client.request(query, variables);
        return response.event;
    }

    public async getTournamentSets(
        slug: string,
        eventSlug: string,
        eventId: string,
        page: number = 1,
        perPage: number = 20
    ): Promise<SetConnection | null> {
        const client = this.initializeGqlClient();

        const variables = {
            slug,
            eventSlug,
            eventId,
            page,
            perPage
        };

        try {
            const response: { tournament: Tournament } = await client.request(
                GetTournamentSetsQuery,
                variables
            );

            return response.tournament?.events?.[0]?.sets || null;
        } catch (error) {
            if (error.response && error.response.errors) {
                const errors = error.response.errors;
                if(Array.isArray(errors) && errors.some((e) => e.message.includes('Your query complexity is too high'))) {
                    throw new Error('RATE_LIMIT_EXCEEDED');
                }
            }
            throw error;
        }
    }
}
