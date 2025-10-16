/**
 * A lightweight wrapper for managing values in a Storage-like interface
 * (defaulting to `window.localStorage`), with optional encryption/decryption
 * and automatic initialization of default values.
 *
 * It keeps a private cached value (`#value`) for fast access via `.value`.
 */
declare class LocalStorageManager<T = any> {
  /**
   * The key name under which the data is stored.
   * @readonly
   */
  readonly itemName: string

  /**
   * The default value used when the key does not exist in storage.
   * @private
   */
  private readonly defaultValue?: T

  /**
   * The encryption function used when writing to storage.
   * Defaults to an identity function.
   * @private
   */
  private readonly encryptFn: (value: string) => string

  /**
   * The decryption function used when reading from storage.
   * Defaults to an identity function.
   * @private
   */
  private readonly decryptFn: (value: string | null) => string

  /**
   * The underlying storage backend (defaults to `window.localStorage`).
   * Must implement the standard Storage API.
   * @readonly
   */
  readonly storage: Storage

  /**
   * Internal cached value (updated by `value` setter and `getItem()`).
   * @private
   */
  #value?: T

  /**
   * Creates a new LocalStorageManager instance.
   *
   * @param itemName - The key name under which the data is stored.
   * @param options - Optional configuration.
   */
  constructor(
    itemName: string,
    options?: {
      defaultValue?: T
      encryptFn?: (value: string) => string
      decryptFn?: (value: string | null) => string
      storage?: Storage
    }
  )

  /**
   * Sets the current value in storage.
   * Automatically encrypts and caches the value.
   *
   * @param value - The value to store. Objects are automatically stringified.
   */
  set value(value: T)

  /**
   * Returns the cached value.
   * To update the cache, call {@link getItem}.
   */
  get value(): T

  /**
   * Resets the stored value to the default value.
   * If no default value is defined, the item is removed from storage.
   */
  reset(): void

  /**
   * Synchronizes the internal cache with the latest stored value.
   * Automatically decrypts and parses JSON-prefixed strings.
   *
   * @returns The latest stored value, or the default value if none exists.
   */
  getItem(): T
}

export = LocalStorageManager
export as namespace LocalStorageManager
