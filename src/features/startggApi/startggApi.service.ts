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
    private gqlClient: GraphQLClient;

    constructor(
        @Inject(REQUEST) private request: Request,
        private readonly encryptionService: EncryptionService
    ) {
        const token = this.getTokenFromRequest();
        this.gqlClient = new GraphQLClient('https://api.start.gg/gql/alpha', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
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

    public async getEvent(slug: string): Promise<Event | null> {
        const query = GetEventQuery;
        const variables: QueryEventArgs = {slug};
        const response: { event: Event } = await this.gqlClient.request(query, variables);
        return response.event;
    }

    public async getTop8PlayerData(eventId: string) {
        const query = GetEventTop8PlayerDataQuery;
        const variables: QueryEventArgs = { id: eventId };
        const response: { event: Event } = await this.gqlClient.request(query, variables);
        return response.event;
    }
}