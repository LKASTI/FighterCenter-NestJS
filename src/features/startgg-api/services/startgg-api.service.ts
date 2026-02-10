import { BadRequestException, Inject, Injectable, Scope, UnauthorizedException } from "@nestjs/common";
import { GraphQLClient } from "graphql-request";
import { Event, QueryEventArgs, SetConnection, Tournament } from "../graphql/startgg-api.graphql";
import { GetEventQuery, GetEventTop8PlayerDataQuery, GetTournamentSetsQuery } from "../graphql/startgg-api.queries";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { EncryptionService } from "@authentication/encryption/encryption.service";
import { AuthUser } from "@fgclegends/fightercenter-shared-nestjs";

@Injectable({ scope: Scope.REQUEST })
export class StartggApiService {
    constructor(
        @Inject(REQUEST) private request: Request,
        private readonly encryptionService: EncryptionService
    ) {
    }

    /**
     * Get Start.gg API token from request user
     *
     * IMPORTANT: This requires the endpoint to use BaseAuthGuard or SeriesAuthGuard,
     * which fetch the full user object (including encrypted token) from the auth service.
     * JwtAuthGuard alone is NOT sufficient.
     *
     * SECURITY NOTE (Finding 20):
     * - Uses user's OAuth token (preferred, user-specific)
     * - Per-user audit trail
     * - Tokens auto-refresh via auth service
     */
    private getTokenFromRequest(): string {
        const user = this.request.user as AuthUser;

        if (!user) {
            throw new UnauthorizedException(
                "Authentication required. Endpoint must use BaseAuthGuard or SeriesAuthGuard."
            );
        }

        if (!user.startggEncryptedToken) {
            throw new UnauthorizedException(
                "Start.gg account not linked. Please link your Start.gg account."
            );
        }

        return this.encryptionService.decrypt(user.startggEncryptedToken);
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
