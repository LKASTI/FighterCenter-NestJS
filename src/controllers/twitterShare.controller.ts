import { Controller } from "@nestjs/common";
import { TwitterShareService } from "../domain/twitterShare/twitterShare.service";

//TODO rate limiting
@Controller('twitterShare')
export class TwitterShareController {
    constructor(private readonly twitterShareService: TwitterShareService) {}


}