import { BadRequestException, Inject, Injectable, Scope } from "@nestjs/common";
import { GraphQLClient } from "graphql-request";
import { Event, QueryEventArgs } from "./startggApi.graphql";
import { GetEventQuery, GetEventTop8PlayerDataQuery } from "./startggApi.queries";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { StartggUser } from "../../domain/entities";
import { EncryptionService } from "../../authentication/encryption/encryption.service";

@Injectable({ scope: Scope.REQUEST })
export class StartggApiService {
    constructor(
        @Inject(REQUEST) private request: Request,
        private readonly encryptionService: EncryptionService
    ) {
    }

    private getTokenFromRequest(): string {
        try {
            if(this.request.user && (this.request.user as StartggUser).startggEncryptedToken) {
                return this.encryptionService.decrypt((this.request.user as StartggUser).startggEncryptedToken);
            } else {
                throw new BadRequestException();
            }
        } catch {
            const backupToken = process.env.STARTGG_API_KEY; // backup token
            if(!backupToken) {
                throw new BadRequestException("No token provided");
            }
            return backupToken;
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
}