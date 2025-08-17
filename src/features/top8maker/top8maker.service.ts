import { Injectable } from "@nestjs/common";
import { StartggApiService } from "../startggApi/startggApi.service";


@Injectable()
export class Top8MakerService {
    constructor(
        private readonly startggApiService: StartggApiService
    ) {}


}