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

    // Tournament keys (Phase 2 - to be added later)
    tournament: {
        byId: (id: number) => `tournament:${id}`,
        list: (queryHash: string) => `tournament:list:${queryHash}`,
    },

    // Event/Series keys (Phase 2 - to be added later)
    event: {
        byId: (id: number) => `event:${id}`,
    },

    // Player keys (Phase 2 - to be added later)
    player: {
        byId: (id: number) => `player:${id}`,
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

    // Tournament tags (Phase 2 - to be added later)
    tournament: {
        byId: (id: number) => `tournament-${id}`,
        event: (eventId: number) => `event-${eventId}`,
    },

    // Player tags (Phase 2 - to be added later)
    player: {
        byId: (playerId: number) => `player-${playerId}`,
    },
};
