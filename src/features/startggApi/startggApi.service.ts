import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";


@Injectable()
export class StartggApiService {
    constructor(
        private readonly httpService: HttpService
    ) {}


}