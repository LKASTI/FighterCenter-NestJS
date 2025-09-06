import gql from "graphql-tag";

export const GetTournamentSetsQuery = gql`
  query GetTournamentSets($slug: String!, $eventSlug: String!, $eventId: ID!, $page: Int!, $perPage: Int!) {
    tournament(slug: $slug) {
      events(filter: {videogameId: 43868, slug: $eventSlug, id: $eventId}) {
        sets(page: $page, perPage: $perPage, sortType: RECENT) {
          nodes {
            id
            displayScore
            winnerId
            round
            fullRoundText
            totalGames
            setGamesType
            phaseGroup {
              phase {
                name
              }
            }
            slots {
              entrant {
                id
                name
                initialSeedNum
                standing {
                  placement
                }
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
                entrant { id }
                character { name }
              }
            }
          }
        }
      }
    }
  }
`;

export const GetEventQuery = gql`
            query GetEvent($slug: String!) {
                event(slug: $slug) {
                    id,
                    isOnline,
                    name,
                    videogame {
                        id,
                        name
                    },
                    numEntrants,
                    tournament {
                        name,
                    }
                }
            }
        `;

export const GetEventTop8PlayerDataQuery = gql`
            query GetEventTop8Characters($id: ID!) {
              event(id: $id) {
                id
                name
                standings(query: {perPage: 8, page: 1}) {
                  nodes {
                    placement
                    entrant {
                      id
                      name
                      participants {
                        gamerTag
                        user {
                          id
                          authorizations {
                            externalUsername
                            type
                          }
                          location {
                            country
                            state
                            city
                          }
                          images {
                            type
                            url
                          }
                        }
                      }
                      paginatedSets(page: 1, perPage: 10) {
                        nodes {
                          id
                          games {
                            id
                            selections {
                              entrant {
                                id
                                name
                              }
                              character {
                                id
                                name
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
        `;