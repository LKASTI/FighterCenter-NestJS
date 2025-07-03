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

        // const isLocalDevelopment = process.env.FRONTEND_URL?.includes('localhost');
        // if(isLocalDevelopment) {
        //     console.log('Development mode: passing token via URL');
        //     res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
        // }

        console.log('=== COOKIE DEBUG ===');
        console.log('Frontend URL:', process.env.FRONTEND_URL);
        console.log('Request Origin:', req.get('Origin'));
        console.log('Request Host:', req.get('Host'));
        console.log('Node Environment:', process.env.NODE_ENV);
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: parseInt(process.env.COOKIE_EXPIRATION_DURATION) * 1000 , //TODO:
            path: '/',
        }
        res.cookie('auth-token', token, cookieOptions);

        console.log('Response headers before redirect:', res.getHeaders());
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