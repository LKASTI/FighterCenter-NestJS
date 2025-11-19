import { Event } from "../../graphql/startgg-api.graphql";

// For now, we'll use the GraphQL-generated Event type as the response
// In the future, this can be customized to include only the fields we want to expose
export type EventResponseDto = Event;
