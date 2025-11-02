import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * TaggedCacheService provides tag-based cache invalidation.
 *
 * When caching data, you can associate it with tags (e.g., 'tournament-123', 'event-456').
 * Later, you can invalidate all caches with a specific tag in one operation.
 *
 * Example:
 *   await cache.setWithTags('tournament:123', data, ['tournament-123', 'event-5'], 3600000);
 *   await cache.invalidateByTag('event-5'); // Clears all caches tagged with 'event-5'
 */
@Injectable()
export class TaggedCacheService {
    // Maps tag -> Set of cache keys with that tag
    private tagToKeys = new Map<string, Set<string>>();

    // Maps cache key -> Set of tags for that key (reverse mapping)
    private keyToTags = new Map<string, Set<string>>();

    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        @Optional() private logger?: Logger,
    ) {}

    /**
     * Cache a value with associated tags for group invalidation
     * @param key Cache key
     * @param value Value to cache
     * @param tags Array of tags to associate with this cache entry
     * @param ttl Time-to-live in milliseconds
     */
    async setWithTags(
        key: string,
        value: any,
        tags: string[],
        ttl: number,
    ): Promise<void> {
        // Store the cached value
        await this.cacheManager.set(key, value, ttl);

        // Update tag mappings
        this.addTagMappings(key, tags);
    }

    /**
     * Retrieve a cached value
     * @param key Cache key
     * @returns Cached value or undefined
     */
    async get<T>(key: string): Promise<T | undefined> {
        return await this.cacheManager.get<T>(key);
    }

    /**
     * Invalidate all caches associated with a specific tag
     * @param tag Tag to invalidate
     */
    async invalidateByTag(tag: string): Promise<void> {
        const keys = this.tagToKeys.get(tag);

        if (!keys || keys.size === 0) {
            return;
        }

        // Delete all cache entries with this tag
        const deletePromises = Array.from(keys).map(key =>
            this.cacheManager.del(key)
        );
        await Promise.all(deletePromises);

        // Clean up tag mappings
        this.removeTagMappings(Array.from(keys));
    }

    /**
     * Invalidate all caches associated with any of the provided tags
     * @param tags Array of tags to invalidate
     */
    async invalidateByTags(tags: string[]): Promise<void> {
        const allKeys = new Set<string>();

        // Collect all keys from all tags
        for (const tag of tags) {
            const keys = this.tagToKeys.get(tag);
            if (keys) {
                keys.forEach(key => allKeys.add(key));
            }
        }

        if (allKeys.size === 0) {
            return;
        }

        // Delete all collected cache entries
        const deletePromises = Array.from(allKeys).map(key =>
            this.cacheManager.del(key)
        );
        await Promise.all(deletePromises);

        // Clean up tag mappings
        this.removeTagMappings(Array.from(allKeys));
    }

    /**
     * Delete a single cache entry
     * @param key Cache key to delete
     */
    async del(key: string): Promise<void> {
        await this.cacheManager.del(key);
        this.removeTagMappings([key]);
    }

    /**
     * Clear all caches and reset tag mappings
     * Note: This clears tracked caches via tag map, not the entire cache store
     */
    async reset(): Promise<void> {
        // Delete all tracked cache entries
        const allKeys = new Set<string>();
        this.tagToKeys.forEach(keys => {
            keys.forEach(key => allKeys.add(key));
        });

        const deletePromises = Array.from(allKeys).map(key =>
            this.cacheManager.del(key)
        );
        await Promise.all(deletePromises);

        // Clear tag mappings
        this.tagToKeys.clear();
        this.keyToTags.clear();
    }

    /**
     * Add tag mappings for a cache key
     * @private
     */
    private addTagMappings(key: string, tags: string[]): void {
        // Update tagToKeys map
        for (const tag of tags) {
            if (!this.tagToKeys.has(tag)) {
                this.tagToKeys.set(tag, new Set());
            }
            this.tagToKeys.get(tag)!.add(key);
        }

        // Update keyToTags map
        if (!this.keyToTags.has(key)) {
            this.keyToTags.set(key, new Set());
        }
        for (const tag of tags) {
            this.keyToTags.get(key)!.add(tag);
        }
    }

    /**
     * Remove tag mappings for cache keys
     * @private
     */
    private removeTagMappings(keys: string[]): void {
        for (const key of keys) {
            const tags = this.keyToTags.get(key);

            if (tags) {
                // Remove this key from all its tags in tagToKeys
                for (const tag of tags) {
                    const tagKeys = this.tagToKeys.get(tag);
                    if (tagKeys) {
                        tagKeys.delete(key);

                        // If no more keys for this tag, remove the tag entirely
                        if (tagKeys.size === 0) {
                            this.tagToKeys.delete(tag);
                        }
                    }
                }

                // Remove the key from keyToTags
                this.keyToTags.delete(key);
            }
        }
    }

    /**
     * Get statistics about the tag map (for debugging/monitoring)
     */
    getStats(): { totalTags: number; totalKeys: number; tagMapSize: number } {
        const uniqueKeys = new Set<string>();
        this.tagToKeys.forEach(keys => {
            keys.forEach(key => uniqueKeys.add(key));
        });

        return {
            totalTags: this.tagToKeys.size,
            totalKeys: uniqueKeys.size,
            tagMapSize: this.keyToTags.size,
        };
    }
}
