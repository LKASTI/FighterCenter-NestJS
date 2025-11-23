/**
 * Tracks all entities created during a tournament import process.
 * Used for rollback cleanup if the import fails at any point.
 */
export class TournamentImportContext {

  /** Event (tournament series) entity ID */
  eventId?: number;

  eventWasCreated: boolean = false;

  tournamentId?: number;

  /** Set of Player IDs created during import (accumulated across batches) */
  playerIds: Set<number> = new Set();

  /** Array of PlayerTournamentRun composite keys created (accumulated across batches) */
  ptrKeys: Array<{ playerID: number; tournamentID: number }> = [];

  /** Array of TournamentSet IDs created (accumulated across batches) */
  setIds: number[] = [];

  /** Array of TournamentMatch IDs created (accumulated across batches) */
  matchIds: number[] = [];

  importStatus: 'in_progress' | 'succeeded' | 'failed' = 'in_progress';

  /** When the import started */
  startTime: Date = new Date();

  /** When the import ended (success or failure) */
  endTime?: Date;

  /**
   * Creates a summary of created entities for audit logging
   */
  getSummary() {
    return {
      eventId: this.eventId,
      eventWasCreated: this.eventWasCreated,
      tournamentId: this.tournamentId,
      playerCount: this.playerIds.size,
      ptrCount: this.ptrKeys.length,
      setCount: this.setIds.length,
      matchCount: this.matchIds.length,
    };
  }

  /**
   * Calculates the duration of the import in milliseconds
   */
  getDurationMs(): number | null {
    if (!this.endTime) {
      return null;
    }
    return this.endTime.getTime() - this.startTime.getTime();
  }
}
