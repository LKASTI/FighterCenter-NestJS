// auth/strategies/startgg.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { HttpService } from '@nestjs/axios';
import { StartggUserService } from "../../domain/startggUser/startggUser.service";

@Injectable()
export class StartGGStrategy extends PassportStrategy(Strategy, 'startgg') {
	constructor(
		private httpService: HttpService,
		private startggUserService: StartggUserService,
	) {
		super({
			authorizationURL: 'https://start.gg/oauth/authorize',
			tokenURL: 'https://api.start.gg/oauth/access_token',
			clientID: process.env.STARTGG_CLIENT_ID,			//TODO: update env
			clientSecret: process.env.STARTGG_CLIENT_SECRET,	//TODO: update env
			callbackURL: process.env.STARTGG_CALLBACK_URL,		//TODO: update env
			scope: ['user.identity', 'user.email'],
		});
	}

	async validate(accessToken: string, refreshToken: string, params: any, profile: any): Promise<any> {
		const userData = await this.fetchStartGGUser(accessToken);

		const user = await this.startggUserService.findOrCreate({
			startggId: userData.player?.id.toString(),
			startggUsername: userData.slug,
			startggGamerTag: userData.player?.gamerTag,
			roles: [],
			tournamentSeriesAssigned: [],
		});

		return user;
	}

	//TODO: check over docs
	private async fetchStartGGUser(accessToken: string) {
		const query = `
		  query {
			currentUser {
			  id
			  slug
			  player {
				gamerTag
				id
			  }
			}
		  }
		`;

		const response = await this.httpService.axiosRef.post(
			'https://api.start.gg/gql/alpha',
			{ query },
			{
				headers: {
					'Authorization': `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
				}
			}
		);

		if (!response.data.data?.currentUser) {
			throw new Error('Unable to fetch user data');
		}

		return response.data.data.currentUser;
	}
}