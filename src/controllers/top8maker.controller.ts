import { Controller } from "@nestjs/common";
import { Top8MakerService } from "../features/top8maker/top8maker.service";


@Controller('top8maker')
export class Top8makerController {
    constructor(
        private readonly Top8MakerService: Top8MakerService
    ) {
    }


}