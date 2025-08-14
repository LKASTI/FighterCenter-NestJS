import { Controller } from "@nestjs/common";
import { StartggApiService } from "../features/startggApi/startggApi.service";

@Controller('startggApi')
export class StartggApiController{
    constructor(
        private readonly startggApiService: StartggApiService
    ) {}


}