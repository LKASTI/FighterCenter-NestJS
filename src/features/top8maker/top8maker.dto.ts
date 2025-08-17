export class Top8MakerPlayer {
    constructor() {}

    name: string;
    placement: number;
    primaryCharacter: string;
    secondaryCharacter: string;
    country: string;
    twitter: string;
}

export class Top8MakerDataResponse {
    constructor() {}

    tournamentName: string;
    numEntrants: number;
    players: Top8MakerPlayer[];
}