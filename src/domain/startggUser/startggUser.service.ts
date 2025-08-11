import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { StartggUserRepository } from "./startggUser.repository";
import { CreateStartggUserDTO, FindStartggUsersQueryDTO, UpdateStartggUserDTO } from "../../dtos/startggUser.dto";
import { StartggUser } from "../entities/startggUser.entity";
import { EncryptionService } from "../../authentication/encryption/encryption.service";
import { StartggRefreshTokenResponse } from "./startggUser.interfaces";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class StartggUserService {
    constructor(
        @InjectRepository(StartggUserRepository)
        private readonly startggUserRepository: StartggUserRepository,
        private readonly encryptionService: EncryptionService,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {}

    public async create(
        createStartggUserDTO: CreateStartggUserDTO,
    ): Promise<StartggUser> {
        return await this.startggUserRepository.createAndSave(
            createStartggUserDTO,
        );
    }

    public async findOrCreate(
        createStartggUserDTO: CreateStartggUserDTO,
    ): Promise<StartggUser> {
        let user = await this.startggUserRepository.findOne({
            where: { startggId: createStartggUserDTO.startggId },
        });
        console.log("findOrCreate user:", user);
        if (!user) {
            user =
                await this.startggUserRepository.createAndSave(
                    createStartggUserDTO,
                );
        } else if(Date.now() >= user.startggTokenExpiresIn) {
            // Try to refresh token
            try {
                const res: StartggRefreshTokenResponse = await this.refreshStartggToken(
                    user.startggEncryptedRefreshToken,
                    user.startggUserID
                );
                user.startggEncryptedRefreshToken = res.encryptedRefreshToken;
                user.startggEncryptedToken = res.encryptedAccessToken;
                user.startggTokenExpiresIn = res.expiresIn;
            } catch (error) {
                console.error('Failed to refresh token for existing user:', error);
                await this.update(user.startggUserID, {
                    startggEncryptedRefreshToken: createStartggUserDTO.startggEncryptedRefreshToken,
                    startggEncryptedToken: createStartggUserDTO.startggEncryptedToken,
                    startggTokenExpiresIn: createStartggUserDTO.startggTokenExpiresIn
                } as UpdateStartggUserDTO);
            }
        }

        return user;
    }

    /**
     * Refresh the StartGG access token and update user record
     * @param encryptedRefreshToken the encrypted StartGG refresh token
     * @param startggUserId the StartGG user to update
     * @return the newly encrypted token, refresh token, and expire time
     */
    public async refreshStartggToken(encryptedRefreshToken: string, startggUserId: string): Promise<StartggRefreshTokenResponse> {
        const decryptedRefreshToken = this.encryptionService.decrypt(encryptedRefreshToken);
        if(!decryptedRefreshToken) {
            console.error('Failed to decrypt StartGG refresh token');
            return null;
        }
        try {
            const response = await this.httpService.axiosRef.post(
                'https://api.start.gg/oauth/refresh',
                {
                    grant_type: 'refresh_token',
                    refresh_token: decryptedRefreshToken,
                    client_id: this.configService.get("STARTGG_CLIENT_ID"),
                    client_secret: this.configService.get("STARTGG_CLIENT_SECRET"),
                    scope: 'user.identity user.email',
                    redirect_uri: this.configService.get("STARTGG_CALLBACK_URL")
                },
                {
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            const { accessToken, refreshToken, expiresIn } = response.data;
            console.log('startgg refresh response:', response.data);
            if (!accessToken || !refreshToken) {
                console.error('StartGG refresh response missing tokens:', response.data);
                throw new Error('Invalid StartGG refresh response' + JSON.stringify(response.data));
            }
            const expire = Date.now() + (expiresIn || 604800) * 1000;
            const encToken = this.encryptionService.encrypt(accessToken);
            const encRefreshToken = this.encryptionService.encrypt(refreshToken);

            // update user
            await this.update(startggUserId, {
                startggEncryptedToken: encToken,
                startggEncryptedRefreshToken: encRefreshToken,
                startggTokenExpiresIn: expire
            } as UpdateStartggUserDTO)

            return {
                encryptedAccessToken: encToken,
                encryptedRefreshToken: encRefreshToken,
                expiresIn: expire
            };
        } catch (error) {
            console.error('Failed to refresh StartGG token:', error);
            return null;
        }
    }

    public async findAll(query: FindStartggUsersQueryDTO) {
        return await this.startggUserRepository.findAll(query);
    }

    public async findById(id: string): Promise<StartggUser> {
        return await this.startggUserRepository.findOneBy({
            startggUserID: id,
        });
    }

    public async findByStartggId(id: string): Promise<StartggUser> {
        return await this.startggUserRepository.findOneBy({
            startggId: String(id).trim()
        });
    }

    public async update(
        id: string,
        updateStartggUserDTO: UpdateStartggUserDTO,
    ): Promise<StartggUser> {
        const startggUser = await this.startggUserRepository.findOneBy({
            startggUserID: id,
        });

        if (!startggUser) {
            return null;
        }

        await this.startggUserRepository.update(
            { startggUserID: id },
            updateStartggUserDTO,
        );
        return await this.startggUserRepository.findOneBy({
            startggUserID: id,
        });
    }

    public async remove(id: string): Promise<boolean> {
        const result = await this.startggUserRepository.delete({
            startggUserID: id,
        });
        return result.affected > 0;
    }

    public async removeByStartggId(id: string): Promise<boolean> {
        const result = await this.startggUserRepository.delete({
            startggId: id,
        });
        return result.affected > 0;
    }
}
