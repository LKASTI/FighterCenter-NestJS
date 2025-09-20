export const SeriesDataTableDataQuery = `
    WITH player_tournaments AS (
        SELECT
            p.player_id,
            p.player_entry_name AS player_name,
            pl.startgg_profile_image_url AS profile_image,
            pl.country,
            t.tournament_id,
            p.placement,
            p.characters_used
        FROM
            tournament t
                JOIN
            player_tournament_run p ON t.tournament_id = p.tournament_id
                JOIN
            player pl ON p.player_id = pl.player_id
        WHERE
            t.event_id = $1
    ),
         player_placement_counts AS (
             SELECT
                 player_id,
                 placement,
                 COUNT(*) as placement_count
             FROM
                 player_tournaments
             GROUP BY
                 player_id, placement
         ),
         player_best_placement_info AS (
             SELECT
                 player_id,
                 MIN(placement) as best_placement,
                 MAX(CASE WHEN placement = (
                     SELECT MIN(placement)
                     FROM player_tournaments pt2
                     WHERE pt2.player_id = pt.player_id
                 ) THEN placement_count ELSE 0 END) as best_placement_count
             FROM
                 player_tournaments pt
                     JOIN
                 player_placement_counts ppc USING (player_id, placement)
             GROUP BY
                 player_id
         ),
         player_names AS (
             SELECT
                 player_id,
                 MIN(player_name) AS consistent_player_name,
                 MIN(profile_image) AS consistent_profile_image,
                 MIN(country) AS consistent_country
             FROM
                 player_tournaments
             GROUP BY
                 player_id
         )
    SELECT
        pn.player_id AS "playerId",
        pn.consistent_player_name AS "playerName",
        pn.consistent_profile_image as "startggProfileImageURL",
        pn.consistent_country as "country",
        jsonb_object_agg(
            ppc.placement::text,
            ppc.placement_count
        ) AS "placementToCount",
        COALESCE(COUNT(DISTINCT pt.tournament_id), 0)::integer AS "attendance",
        ARRAY(
            SELECT char
            FROM (
                     SELECT char, COUNT(*) as usage_count
                     FROM player_tournaments pt2
                              CROSS JOIN UNNEST(pt2.characters_used) AS char
                     WHERE pt2.player_id = pt.player_id
                       AND pt2.characters_used IS NOT NULL
                     GROUP BY char
                     ORDER BY usage_count DESC, char
                 ) char_counts
        ) AS "charactersUsed"
    FROM
        player_tournaments pt
            JOIN
        player_placement_counts ppc ON pt.player_id = ppc.player_id
            JOIN
        player_names pn ON pt.player_id = pn.player_id
            JOIN
        player_best_placement_info pbpi ON pt.player_id = pbpi.player_id
    GROUP BY
        pt.player_id,
        pn.consistent_player_name,
        pn.consistent_profile_image,
        pn.consistent_country,
        pbpi.best_placement,
        pbpi.best_placement_count
    ORDER BY
        pbpi.best_placement ASC,  -- Order by best placement
        pbpi.best_placement_count DESC,  -- Then by how many times they got best placement
        COUNT(DISTINCT pt.tournament_id) DESC;  -- Then by attendance
`