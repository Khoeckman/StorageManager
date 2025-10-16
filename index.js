import TRA from './TRA/TRA.js'

/**
 * @class StorageManager
 * @classdesc A lightweight and efficient wrapper for managing data in a Storage-like interface
 * (defaulting to {@link window.localStorage}), with optional encryption and decryption support.
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
 * // Example usage:
 * const storage = new StorageManager('userSettings', {
 *   defaultValue: { theme: 'dark', language: 'en' },
 *   encryptFn: (value) => btoa(value),  // optional encryption
 *   decryptFn: (value) => atob(value),  // optional decryption
 * });
 *
 * storage.value = { theme: 'light' };   // stores encrypted and cached
 * console.log(storage.value);           // fast access from memory cache
 *
 * // Modify storage externally:
 * localStorage.setItem('userSettings', '{"theme":"blue"}');
 *
 * // Cache is now outdated; resync it:
 * storage.getItem();
 * console.log(storage.value);           // now reflects {"theme":"blue"}
 *
 * @example
 * // Using a custom storage (e.g., sessionStorage)
 * const sessionStore = new StorageManager('tempData', {
 *   storage: window.sessionStorage,
 *   defaultValue: 'none',
 * });
 * sessionStore.value = 'temporary';
 *
 * @source https://github.com/Khoeckman/StorageManager
 */
export default class StorageManager {
  static version = __VERSION__

  #value

  /**
   * Creates a new StorageManager instance.
   *
   * @param {string} itemName - The key name under which the data will be stored.
   * @param {Object} [options={}] - Optional configuration parameters.
   * @param {*} [options.defaultValue] - The default value to use if the key does not exist in storage.
   * @param {Function} [options.encryptFn] - A custom function to encrypt values before saving.
   * Should accept one argument (the raw value) and return an encrypted string.
   * @param {Function} [options.decryptFn] - A custom function to decrypt values after retrieving.
   * Should accept one argument (the stored string) and return the decrypted value.
   * @param {Storage} [options.storage=window.localStorage] - A custom storage provider.
   * Must implement the standard Storage API (`getItem`, `setItem`, `removeItem`).
   *
   * @throws {TypeError} Throws if `itemName` is not a string.
   * @throws {TypeError} Throws if `encryptFn` or `decryptFn` are defined but not functions.
   * @throws {TypeError} Throws if `storage` does not implement the standard Storage API.
   */
  constructor(
    itemName,
    { defaultValue, encryptFn = TRA.encrypt, decryptFn = TRA.decrypt, storage = window.localStorage } = {}
  ) {
    if (typeof itemName !== 'string') {
      throw new TypeError('itemName is not a string')
    }

    /** @private @readonly */
    this.itemName = itemName

    /** @private */
    this.defaultValue = defaultValue

    if (encryptFn && typeof encryptFn !== 'function') {
      throw new TypeError('encryptFn is defined but is not a function')
    }
    this.encryptFn = encryptFn || ((value) => value)

    if (decryptFn && typeof decryptFn !== 'function') {
      throw new TypeError('decryptFn is defined but is not a function')
    }
    this.decryptFn = decryptFn || ((value) => value)

    if (
      !storage ||
      typeof storage.getItem !== 'function' ||
      typeof storage.setItem !== 'function' ||
      typeof storage.removeItem !== 'function'
    ) {
      throw new TypeError('storage must implement the standard Storage API')
    }

    /** @private @readonly */
    this.storage = storage

    // Initialize if missing
    if (this.getItem() === undefined) this.reset()
  }

  /**
   * Sets the current value in storage.
   * Automatically encrypts and caches the value.
   *
   * @param {*} value - The value to store. Objects are automatically stringified.
   */
  set value(value) {
    this.#value = value
    if (typeof value !== 'string') '\0' + JSON.stringify(value)
    this.storage.setItem(this.itemName, this.encryptFn('' + value))
  }

  /**
   * Gets the current cached value.
   *
   * This getter is **very fast**, as it avoids decrypting or parsing each time.
   * However, it will not reflect manual changes to the underlying storage made
   * outside this class. To refresh the cache, call {@link StorageManager.getItem|getItem()}.
   *
   * @returns {*} The cached stored value.
   */
  get value() {
    return this.#value
  }

  /**
   * Resets the stored value to the default value.
   * If no default value is defined, the item is removed from storage.
   *
   * @returns {*} The stored value after reset.
   */
  reset() {
    if (this.defaultValue === undefined) {
      this.storage.removeItem(this.itemName)
      return (this.#value = undefined)
    }
    return (this.value = this.defaultValue)
  }

  /**
   * Synchronizes the internal cache with the latest stored value.
   * Reads the actual value from storage, decrypts and parses it,
   * then updates the internal cache (`#value`).
   *
   * @returns {*} The latest stored value, or the default value if none exists.
   */
  getItem() {
    let value = this.storage.getItem(this.itemName)
    if (typeof value === 'string' && value.startsWith('\0')) value = JSON.parse(this.decryptFn(value).slice(1))
    return (this.#value = value ?? this.defaultValue)
  }
}
