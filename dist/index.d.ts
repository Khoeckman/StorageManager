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
declare class StorageManager<T> {
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
     * @param {T | undefined} value - The value to store. Objects are automatically stringified.
     */
    set value(value: T | undefined);
    /**
     * Gets the current cached value.
     *
     * @returns {T | undefined} The cached value.
     */
    get value(): T | undefined;
    /**
     * Retrieves and synchronizes the internal cache with the latest stored value.
     *
     * Applies decoding (either custom `decodeFn` or instance's `decodeFn`) and parses JSON values.
     *
     * @param {(value: string) => string} [decodeFn=this.decodeFn] - Optional function to decode the raw stored string.
     * @returns {T | undefined} The actual value from storage, or the default value if none exists.
     */
    getItem(decodeFn?: (value: string) => string): T | undefined;
    /** Resets the stored value to the default value. */
    reset(): T | undefined;
}
export default StorageManager;
export { default as TRA } from './TRA/TRA';
export { default as ByteArrayConverter } from './TRA/ByteArrayConverter';
