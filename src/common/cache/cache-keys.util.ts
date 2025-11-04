/**
 * Centralized cache key definitions to prevent typos and ensure consistency.
 *
 * Usage:
 *   const key = CacheKeys.ranked.allPhases();
 *   await cache.get(key);
 */
export const CacheKeys = {
    ranked: {
        // Metadata endpoints
        allPhases: () => 'ranked:phases:all',
        weeklyDatesByPhase: (phase: number) => `ranked:phases:${phase}:dates`,
        distinctDatePhaseSeason: () => 'ranked:distinct-dps',

        // Data endpoints
        rankingsByDatePhase: (date: string, phase: number) =>
            `ranked:rankings:${date}:${phase}`,
        allRankings: (queryHash: string) => `ranked:rankings:all:${queryHash}`,
        byId: (id: number) => `ranked:ranking:${id}`,

        // Profile endpoints
        profileById: (usercode: number) => `ranked:profile:${usercode}`,

        // Character endpoints
        characterById: (id: number) => `ranked:character:${id}`,
    },

    tournament: {
        byId: (id: number) => `tournament:${id}`,
        list: (queryHash: string) => `tournament:list:${queryHash}`,
        gamePatches: (eventID: number) => `tournament:event:${eventID}:patches`,
    },

    tournamentSet: {
        byTournamentId: (tournamentID: number) => `tournament:${tournamentID}:sets`,
        list: (queryHash: string) => `tournament-set:list:${queryHash}`,
    },

    tournamentSeries: {
        latestByEventIds: (queryHash: string) => `series:latest:${queryHash}`,
        topPlayersByTournamentIds: (queryHash: string) => `series:top-players:${queryHash}`,
        playersByTournamentId: (tournamentID: number) => `tournament:${tournamentID}:players`,
    },

    event: {
        byId: (id: number) => `event:${id}`,
        list: (queryHash: string) => `event:list:${queryHash}`,
    },

    player: {
        byId: (id: number) => `player:${id}`,
        list: (queryHash: string) => `player:list:${queryHash}`,
    },

    playerSeriesPerformance: {
        allForSeries: (eventID: number) => `series:${eventID}:perf:all`,
        performanceData: (eventID: number, playerID: number) =>
            `series:${eventID}:perf:player:${playerID}`,
        playerSets: (eventID: number, playerID: number) =>
            `series:${eventID}:sets:player:${playerID}`,
    },
};

/**
 * Centralized cache tag definitions for group invalidation.
 *
 * Usage:
 *   const tags = [CacheTags.ranked.phase(1), CacheTags.ranked.allRankedData()];
 *   await cache.setWithTags(key, value, tags, ttl);
 */
export const CacheTags = {
    ranked: {
        phase: (phase: number) => `ranked-phase-${phase}`,
        date: (date: string) => `ranked-date-${date}`,
        season: (season: number) => `ranked-season-${season}`,
        profile: (usercode: number) => `ranked-profile-${usercode}`,
        allRankedData: () => 'ranked-all', // Nuclear tag for all ranked caches
    },

    tournament: {
        byId: (id: number) => `tournament-${id}`,
        event: (eventId: number) => `event-${eventId}`,
        allLists: () => 'tournament-lists', // Tag for all tournament list queries
    },

    tournamentSet: {
        tournament: (tournamentId: number) => `tournament-${tournamentId}-sets`,
    },

    event: {
        byId: (eventId: number) => `event-${eventId}`,
        allLists: () => 'event-lists', // Tag for all event list queries
    },

    player: {
        byId: (playerId: number) => `player-${playerId}`,
        allLists: () => 'player-lists', // Tag for all player list queries
    },

    playerSeriesPerformance: {
        event: (eventId: number) => `event-${eventId}-perf`,
        player: (eventId: number, playerId: number) => `event-${eventId}-perf-player-${playerId}`,
    },
};
