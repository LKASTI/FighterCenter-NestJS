export const startGGApiUrl = `https://api.start.gg/gql/alpha`;

export const startggTournamentEventNamesBody = `
  query TournamentQuery($slug: String!) {
    tournament(slug: $slug) {
      id
      name
      url
      countryCode
      events(filter: {videogameId: 43868}) {
        id
        name
      }
    }
  }
`;

export const startggTournamentEventsBody = `
    query TournamentQuery($slug: String!, $eventSlug: String!) {
        tournament(slug: $slug) {
            id
            name
            startAt
            endAt
            url
            countryCode
            events(filter: {videogameId: 43868, slug: $eventSlug}) {
                id
                name
                isOnline
                numEntrants
                videogame {
                    displayName
                }
            }
        }
    }
`;

export const startggTournamentSetsBody = `
query TournamentQuery($slug: String!, $eventSlug: String!, $eventId: ID!, $page: Int!, $perPage: Int!) {
  tournament(slug: $slug) {
    id
    name
    events(filter: {videogameId: 43868, slug: $eventSlug, id: $eventId}) {
      id
      name
      sets(
        page: $page
        perPage: $perPage
        sortType: RECENT
      ) {
        nodes {
          totalGames
          setGamesType
          fullRoundText
          id
          displayScore
          winnerId
          round
          phaseGroup {
            phase {
              name
            }
          }
          slots {
            id
            entrant {
							standing {
                placement
              }
            	initialSeedNum
              id
              name
              participants {
                gamerTag
                player {
                  id
                  user {
                    location {
                      country
                    }
                    images(type: "profile") {
                      url
                      type
                      ratio
                    }
                  }
                }
              }
            }
          }
          games {
            id
            winnerId
            orderNum
            selections {
              entrant {
                id
              }
              character {
                name
              }
            }
          }
        }
      }
    }
  }
}
`;
