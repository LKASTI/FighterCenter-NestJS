import gql from "graphql-tag";

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
                    numEntrants
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