import TRA from './TRA/TRA'

// Injected by Rollup
declare const __VERSION__: string

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

class StorageManager<T, DefaultValue extends T | undefined = T | undefined> {
  /** Version of the library, injected via Rollup replace plugin. */
  static readonly version: string = __VERSION__

  static readonly TRA: typeof TRA = TRA

  /** Key name under which the data is stored. */
  readonly itemName: string

  /** Default value used when the key does not exist in storage. */
  private readonly defaultValue: DefaultValue

  /** Function to encode values before storing. Defaults to TRA.encrypt with radix 64. */
  private readonly encodeFn: (value: string) => string

  /** Function to decode values when reading. Defaults to TRA.decrypt with radix 64. */
  private readonly decodeFn: (value: string) => string

  /** The underlying storage backend (defaults to `window.localStorage`). */
  readonly storage: Storage

  /** Internal cached value to improve access speed. */
  #value?: T

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
  constructor(
    itemName: string,
    options: {
      defaultValue?: DefaultValue
      encodeFn?: (value: string) => string
      decodeFn?: (value: string) => string
      storage?: Storage
    } = {}
  ) {
    const {
      defaultValue,
      encodeFn = (value: string) => StorageManager.TRA.encrypt(value, 64),
      decodeFn = (value: string) => StorageManager.TRA.decrypt(value, 64),
      storage = window.localStorage,
    } = options

    if (typeof itemName !== 'string') throw new TypeError('itemName is not a string')
    this.itemName = itemName
    this.defaultValue = defaultValue as DefaultValue

    if (encodeFn && typeof encodeFn !== 'function') throw new TypeError('encodeFn is defined but is not a function')
    this.encodeFn = encodeFn || ((v) => v)

    if (decodeFn && typeof decodeFn !== 'function') throw new TypeError('decodeFn is defined but is not a function')
    this.decodeFn = decodeFn || ((v) => v)

    if (!(storage instanceof Storage)) throw new TypeError('storage must be an instance of Storage')
    this.storage = storage

    this.sync()
  }

  /**
   * Sets the current value in storage.
   * Automatically encodes and caches the value.
   *
   * @param {T | DefaultValue} value - The value to store. Objects are automatically stringified.
   */
  set value(value: T | DefaultValue) {
    this.#value = value
    const stringValue = typeof value === 'string' ? value : '\0JSON\0\x20' + JSON.stringify(value)
    this.storage.setItem(this.itemName, this.encodeFn(stringValue))
  }

  /**
   * Gets the current cached value.
   *
   * @returns {T | undefined} The cached value.
   */
  get value(): T | DefaultValue {
    return this.#value ?? this.defaultValue
  }

  /**
   * Retrieves and synchronizes the internal cache (`value`) with the latest stored value.
   *
   * Applies decoding (using the provided `decodeFn` or the instance's default)
   * and automatically parses JSON-formatted values that were stored by this class.
   *
   * @param {(value: string) => string} [decodeFn=this.decodeFn] - Optional custom decoding function for the raw stored string.
   * @returns {T | DefaultValue} The actual decoded and parsed value from storage, or the default value if none exists.
   *
   * @example
   * storage.sync()
   * console.log(storage.value) // Cached value is now up to date with storage
   */
  sync(decodeFn: (value: string) => string = this.decodeFn): T | DefaultValue {
    let value = this.storage.getItem(this.itemName)
    if (typeof value !== 'string') return this.reset()

    // Don't trust the incoming value, it might not be properly encoded
    try {
      value = decodeFn(value)
    } catch (err) {
      console.error(err)
      return this.reset()
    }

    if (!value.startsWith('\0JSON\0\x20')) return (this.value = value as T) // value can only be of type T as it is checked on assignment

    // Slice off '\0JSON\0\x20' prefix
    value = value.slice(7)

    // Manually convert unparseable JSON object
    if (value === 'undefined') return (this.value = undefined as T) // this can only ever happen if type T allows undefined

    return (this.value = JSON.parse(value))
  }

  /**
   * Resets the stored value to its configured default.
   *
   * Updates both the underlying storage and the internal cache.
   *
   * @returns {DefaultValue} The restored default value.
   *
   * @example
   * storage.reset()
   * console.log(storage.value) // Default value
   */
  reset(): DefaultValue {
    return (this.value = this.defaultValue)
  }

  /**
   * Removes this specific key and its value from storage.
   *
   * Also clears the internal cache to prevent stale data access.
   *
   * @returns {void}
   */
  remove(): void {
    this.#value = undefined
    this.storage.removeItem(this.itemName)
  }

  /**
   * Clears **all** data from the associated storage backend.
   *
   * This affects every key in the storage instance, not just the one
   * managed by this StorageManager.
   * Also clears the internal cache to prevent stale data access.
   *
   * @returns {void}
   */
  clear(): void {
    this.#value = undefined
    this.storage.clear()
  }

  /**
   * Checks whether the current cached value matches the configured default value.
   *
   * Uses reference comparison for objects and strict equality for primitives.
   *
   * @returns {boolean} `true` if the cached value equals the default value, otherwise `false`.
   */
  isDefault(): boolean {
    return this.#value === this.defaultValue
  }
}

export default StorageManager
