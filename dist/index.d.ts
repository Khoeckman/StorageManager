type StorageValue<T, HasDefault extends boolean> = HasDefault extends true ? T : T | undefined;
/**
 * @class StorageManager
 * @classdesc A lightweight and efficient wrapper for managing data in a Storage-like interface
 * (defaulting to {@link window.localStorage}), with optional encoding and decoding support.
 * Automatically initializes with its default value if none is present.
 *
 * This class includes an internal cache (`#value`) to improve performance.
 * Using the {@link StorageManager.value|value} getter is significantly faster
 * than reading from storage repeatedly. However, if the stored value is modified
 * externally (e.g., via {@link Storage.setItem} or the browser console),
 * the cached value will become outdated.
 *
 * To re-synchronize the cache with the actual stored value, call
 * {@link StorageManager.getItem|getItem()}.
 *
 * @example
 * const storage = new StorageManager('userSettings', {
 *   defaultValue: { theme: 'dark', language: 'en' },
 *   encodeFn: (value) => btoa(value),  // optional encoding
 *   decodeFn: (value) => atob(value),  // optional decoding
 * });
 *
 * storage.value = { theme: 'light' };   // stores encoded and cached
 * console.log(storage.value);           // fast access from memory cache
 *
 * @example
 * const sessionStore = new StorageManager('tempData', {
 *   storage: window.sessionStorage,
 *   defaultValue: 'none',
 * });
 * sessionStore.value = 'temporary';
 *
 * @source https://github.com/Khoeckman/StorageManager
 */
declare class StorageManager<T, HasDefault extends boolean = false> {
    #private;
    /** Version of the library, injected via Rollup replace plugin. */
    static version: string;
    /** Key name under which the data is stored. */
    readonly itemName: string;
    /** Default value used when the key does not exist in storage. */
    private readonly defaultValue?;
    /** Function to encode values before storing. Defaults to TRA.encrypt with radix 64. */
    private readonly encodeFn;
    /** Function to decode values when reading. Defaults to TRA.decrypt with radix 64. */
    private readonly decodeFn;
    /** The underlying storage backend (defaults to `window.localStorage`). */
    readonly storage: Storage;
    /**
     * Creates a new StorageManager instance.
     *
     * @param {string} itemName - The key name under which the data will be stored.
     * @param {Object} [options={}] - Optional configuration parameters.
     * @param {T} [options.defaultValue] - Default value if the key does not exist.
     * @param {(value: string) => string} [options.encodeFn] - Optional function to encode stored values.
     * @param {(value: string) => string} [options.decodeFn] - Optional function to decode stored values.
     * @param {Storage} [options.storage=window.localStorage] - Optional custom storage backend.
     *
     * @throws {TypeError} If `itemName` is not a string.
     * @throws {TypeError} If `encodeFn` or `decodeFn` are defined but not functions.
     * @throws {TypeError} If `storage` does not implement the standard Storage API.
     */
    constructor(itemName: string, options?: {
        defaultValue?: T;
        encodeFn?: (value: string) => string;
        decodeFn?: (value: string) => string;
        storage?: Storage;
    });
    /**
     * Sets the current value in storage.
     * Automatically encodes and caches the value.
     *
     * @param {StorageValue<T, HasDefault>} value - The value to store. Objects are automatically stringified.
     */
    set value(value: StorageValue<T, HasDefault>);
    /**
     * Gets the current cached value.
     *
     * @returns {StorageValue<T, HasDefault>} The cached value.
     */
    get value(): StorageValue<T, HasDefault>;
    /**
     * Retrieves and synchronizes the internal cache (`value`) with the latest stored value.
     *
     * Applies decoding (using the provided `decodeFn` or the instance's default)
     * and automatically parses JSON-formatted values that were stored by this class.
     *
     * @param {(value: string) => string} [decodeFn=this.decodeFn] - Optional custom decoding function for the raw stored string.
     * @returns {StorageValue<T, HasDefault>} The actual decoded and parsed value from storage, or the default value if none exists.
     *
     * @example
     * storage.sync()
     * console.log(storage.value) // Cached value is now up to date with storage
     */
    sync(decodeFn?: (value: string) => string): StorageValue<T, HasDefault>;
    /**
     * Resets the stored value to its configured default.
     *
     * Updates both the underlying storage and the internal cache.
     *
     * @returns {StorageValue<T, HasDefault>} The restored default value.
     *
     * @example
     * storage.reset()
     * console.log(storage.value) // Default value
     */
    reset(): StorageValue<T, HasDefault>;
    /**
     * Removes this specific key and its value from storage.
     *
     * Also clears the internal cache to prevent stale data access.
     *
     * @returns {void}
     */
    remove(): void;
    /**
     * Clears **all** data from the associated storage backend.
     *
     * This affects every key in the storage instance, not just the one
     * managed by this StorageManager.
     *
     * @returns {void}
     */
    clear(): void;
    /**
     * Checks whether the current cached value matches the configured default value.
     *
     * Uses reference comparison for objects and strict equality for primitives.
     *
     * @returns {boolean} `true` if the cached value equals the default value, otherwise `false`.
     */
    isDefault(): boolean;
}
export default StorageManager;
export { default as TRA } from './TRA/TRA';
export { default as ByteArrayConverter } from './TRA/ByteArrayConverter';
