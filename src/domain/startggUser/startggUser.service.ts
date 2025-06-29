import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { StartggUserRepository } from "./startggUser.repository";
import { CreateStartggUserDTO, FindStartggUsersQueryDTO } from "../../dtos/startggUser.dto";
import { StartggUser } from "../entities/startggUser.entity";


@Injectable()
export class StartggUserService {
	constructor(
		@InjectRepository(StartggUserRepository)
		private readonly startggUserRepository: StartggUserRepository,
	) {}

	public async create(createStartggUserDTO: CreateStartggUserDTO): Promise<StartggUser> {
		return await this.startggUserRepository.createAndSave(createStartggUserDTO);
	}

	public async findOrCreate(createStartggUserDTO: CreateStartggUserDTO): Promise<StartggUser> {
		let user = await this.startggUserRepository.findOne({
			where: { startggId: createStartggUserDTO.startggId },
		})

		if(!user) {
			user = await this.startggUserRepository.createAndSave(createStartggUserDTO);
		}

		return user;
	}

	public async findAll(query: FindStartggUsersQueryDTO) {
		return await this.startggUserRepository.findAll(query);
	}

	public async findById(id: string): Promise<StartggUser> {
		return await this.startggUserRepository.findOneBy({ startggUserID: id });
	}

	public async findByStartggId(id: string): Promise<StartggUser> {
		return await this.startggUserRepository.findOneBy({ startggId: id });
	}

	public async update(
		id: string,
		updateStartggUserDTO: CreateStartggUserDTO,
	): Promise<StartggUser> {
		const startggUser = await this.startggUserRepository.findOneBy({ startggUserID: id });

		if (!startggUser) {
			return null;
		}

		await this.startggUserRepository.update({ startggUserID: id }, updateStartggUserDTO);
		return await this.startggUserRepository.findOneBy({ startggUserID: id });
	}

	public async remove(id: string): Promise<boolean> {
		const result = await this.startggUserRepository.delete({ startggUserID: id });
		return result.affected > 0;
	}

	public async removeByStartggId(id: string): Promise<boolean> {
		const result = await this.startggUserRepository.delete({ startggId: id });
		return result.affected > 0;
	}



}