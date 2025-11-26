// auth/strategies/startgg.strategy.ts
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-oauth2";
import { HttpService } from "@nestjs/axios";
import { StartggUserService } from "../../domain/startggUser/services/startgg-user.service";
import { EncryptionService } from "../encryption/encryption.service";

@Injectable()
export class StartGGStrategy extends PassportStrategy(Strategy, "startgg") {
    constructor(
        private httpService: HttpService,
        private startggUserService: StartggUserService,
        private encryptionService: EncryptionService,
    ) {
        super({
            authorizationURL: "https://start.gg/oauth/authorize",
            tokenURL: "https://api.start.gg/oauth/access_token",
            clientID: process.env.STARTGG_CLIENT_ID,
            clientSecret: process.env.STARTGG_CLIENT_SECRET,
            callbackURL: process.env.STARTGG_CALLBACK_URL,
            scope: ["user.identity", "user.email"],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        params: any,
        profile: any,
    ): Promise<any> {
        const userData = await this.fetchStartGGUser(accessToken);

        const tokenExpiresIn = Date.now() + (4 * 24 * 60 * 60 * 1000);
        const encryptedAccessToken = this.encryptionService.encrypt(accessToken);
        const encryptedRefreshToken = this.encryptionService.encrypt(refreshToken);
        // console.log("startgg strategy encrypted tokens:", {
        //     encryptedAccessToken,
        //     encryptedRefreshToken,
        //     tokenExpiresIn,
        // });

        const user = await this.startggUserService.findOrCreate({
            startggId: userData.player?.id.toString(),
            startggEncryptedToken: encryptedAccessToken,
            startggEncryptedRefreshToken: encryptedRefreshToken,
            startggTokenExpiresIn: tokenExpiresIn,
            startggUsername: userData.slug,
            startggGamerTag: userData.player?.gamerTag,
            email: userData.email || null,
            roles: [],
            tournamentSeriesAssigned: [],
        });

        return user;
    }

    private async fetchStartGGUser(accessToken: string) {
        const query = `
		  query {
			currentUser {
			  id
			  slug
			  email
			  player {
				gamerTag
				id
			  }
			}
		  }
		`;

        const response = await this.httpService.axiosRef.post(
            "https://api.start.gg/gql/alpha",
            { query },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.data.data?.currentUser) {
            throw new Error("Unable to fetch user data");
        }

        return response.data.data.currentUser;
    }
}
