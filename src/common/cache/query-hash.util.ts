/**
 * Converts a query object to a consistent hash string for cache keys.
 *
 * Ensures that query parameters in different orders produce the same hash:
 *
 * @param query Query object to hash
 * @returns Short hash string for use in cache keys
 */
export function hashQuery(query: Record<string, any>): string {
    if (!query || Object.keys(query).length === 0) {
        return 'empty';
    }

    // Sort keys alphabetically and create consistent object
    const sortedKeys = Object.keys(query).sort();
    const sortedObj: Record<string, any> = {};

    for (const key of sortedKeys) {
        const value = query[key];

        // Handle Date objects specially
        if (value instanceof Date) {
            sortedObj[key] = value.toISOString();
        }
        // Handle arrays
        else if (Array.isArray(value)) {
            sortedObj[key] = value.sort();
        }
        // Handle objects recursively
        else if (typeof value === 'object' && value !== null) {
            sortedObj[key] = hashQuery(value);
        }
        // Primitive values
        else {
            sortedObj[key] = value;
        }
    }

    // Create hash from sorted JSON string
    const jsonString = JSON.stringify(sortedObj);
    const hash = Buffer.from(jsonString).toString('base64');

    // Return first 16 characters for reasonable key length
    return hash.slice(0, 16);
}
