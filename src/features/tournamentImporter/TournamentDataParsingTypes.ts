// Parsed StartGG records from Python scripts
export type StartGGTournamentPlayerRecord = {
  name: string;
  ID: number;
  placement: string;
  seed: string;
};

export type StartGGTournamentSetRecord = {
  set_id: number;

  player_one_name: string;
  player_two_name: string;

  player_one_score: string;
  player_two_score: string;

  player_one_placement: number;
  player_two_placement: number;

  player_one_seed: number;
  player_two_seed: number;

  player_one_startgg_id: number;
  player_two_startgg_id: number;

  player_one_characters: string[];
  player_two_characters: string[];

  player_one_country: string;
  player_two_country: string;

  player_one_profile_image_url: string;
  player_two_profile_image_url: string;

  matches_to_win: number;
  winner_name: string;
  round_id: number;
  round_name: string;
  phase_name: string;
  matches: StartGGTournamentMatchRecord[];
};

export type StartGGTournamentMatchRecord = {
  match_id: number;
  match_number: number;
  player_one_character: string | null;
  player_two_character: string | null;
  winner_name: string;
};

// StartGG records directly from API
export type StartGGTournamentSetNodeRecord = {
  fullRoundText: string;
  totalGames: number;
  setGamesType: number;
  id: number;
  displayScore: string;
  winnerId: number;
  round: number;
  phaseGroup: {
    phase: {
      name: string;
    };
  };
  slots: StartGGTournamentSetNodeSlotRecord[];
  games: StartGGTournamentSetNodeGameRecord[];
};

export type StartGGTournamentSetNodeGameRecord = {
  id: number;
  winnerId: number;
  orderNum: number;
  selections: StartGGTournamentSetNodeGameSelectionRecord[];
};

export type StartGGTournamentSetNodeGameSelectionRecord = {
  entrant: {
    id: number;
  };
  character: {
    name: string;
  };
};

export type StartGGTournamentSetNodeSlotRecord = {
  id: number;
  entrant: {
    standing: {
      placement: number;
    };
    initialSeedNum: number;
    id: number;
    name: string;
    participants: StartGGTournamentSetNodeSlotParticipantRecord[];
  };
};

export type StartGGTournamentSetNodeSlotParticipantRecord = {
  gamerTag: string;
  player: {
    id: number;
    user: {
      location: {
        country: string;
      };
      images: StartGGTournamentUserImageRecord[];
    };
  };
};

export type StartGGTournamentUserImageRecord = {
  url: string;
  type: string;
  ratio: number;
};

export type StartGGTournamentDataRecord = {
  id: number;
  name: string;
  startAt: number;
  endAt: number;
  url: string;
  countryCode: string;
  events: StartGGEventRecord[];
};

export type StartGGEventRecord = {
  id: number;
  name: string;
  isOnline: boolean;
  numEntrants: number;
  videogame: {
    displayName: string;
  };
};
