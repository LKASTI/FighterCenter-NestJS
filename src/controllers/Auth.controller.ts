import { Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { JwtService } from "@nestjs/jwt";
import { JwtAuthGuard } from "../authentication/guards/jwtAuth.guard";

@Controller('auth')
export class AuthController {
	constructor(
		private readonly jwtService: JwtService,
	) {}

	@Get('startgg')
	@UseGuards(AuthGuard('startgg'))
	async startGGAuth() {
		// Guard initiates redirect to StartGG
	}

	@Get('startgg/callback')
	@UseGuards(AuthGuard('startgg'))
	async startggCallback(@Req() req, @Res() res) {
		const user = req.user;

		const payload = {
			sub: user.startggId,
			username: user.startggUsername,
			gamerTag: user.startggGamerTag,
			roles: user.roles,
			tournamentSeriesAssigned: user.tournamentSeriesAssigned,
		}

		const token = this.jwtService.sign(payload);

        console.log('env detected:', process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT_NAME);

		res.cookie('auth-token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT_NAME, // HTTPS in production
			sameSite: 'lax',
			maxAge: parseInt(process.env.COOKIE_EXPIRATION_DURATION) * 1000 , //TODO:
		});

		res.redirect(`${process.env.FRONTEND_URL}/auth/callback`);
	}

	@Get('me')
	@UseGuards(JwtAuthGuard)
	async getCurrentUser(@Req() req) {
		return req.user;
	}

	@Post('logout')
	async logout(@Res() res) {
		res.clearCookie('auth-token');
		res.json({ success: true });
	}
}