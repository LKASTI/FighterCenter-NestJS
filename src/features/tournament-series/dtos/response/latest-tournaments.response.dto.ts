import { ApiProperty } from "@nestjs/swagger";
import { Tournament } from "@domain/entities";

export class LatestTournamentsResponseDto {
    @ApiProperty({
        description: "Array of latest tournaments for the requested event series",
        type: [Tournament],
        isArray: true
    })
    data: Tournament[];
}
