;(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports)
    : typeof define === 'function' && define.amd
      ? define(['exports'], factory)
      : ((global = typeof globalThis !== 'undefined' ? globalThis : global || self),
        factory((global.StorageManager = {})))
})(this, function (exports) {
  'use strict'

  /**
   * @class ByteArrayConverter
   * @classdesc Utility class for converting between {@link Uint8Array} and
   * radix-based string representations.
   *
   * - Supports arbitrary numeric bases from 2 (binary) up to 36 (alphanumeric).
   * - Also supports Base64 (64), which is handled with separate
   *   encoding/decoding logic.
   *
   * Each byte is represented as a fixed-width digit group (for bases 2–36),
   * ensuring that conversions are lossless and reversible with
   * {@link encodeByteArrayToString} and {@link decodeStringToByteArray}.
   *
   * @license Copyright (c) 2025 Kyle Hoeckman, All rights reserved.
   */

  class ByteArrayConverter {
    /**
     * Encodes a byte array into a string using the given radix.
     *
     * - For bases 2–36, each byte is converted into a fixed-width string segment
     *   so that the output can be losslessly decoded with
     *   {@link decodeStringToByteArray}.
     * - For radix 64, the output is a Base64-encoded string.
     *
     * @param {Uint8Array} byteArray - The array of bytes to encode.
     * @param {number} radix - The numeric base to use (2–36, or 64 for Base64).
     * @returns {string} Encoded string representation.
     *
     * @throws {TypeError} If `radix` is not an integer.
     * @throws {RangeError} If `radix` is outside the range 2–36 and not 64.
     *
     * @example
     * ```js
     * const bytes = new Uint8Array([15, 255, 128]);
     * const encoded = ByteArrayConverter.encodeByteArrayToString(bytes, 16);
     * // "0fff80"
     * ```
     */
    static encodeByteArrayToString(byteArray, radix) {
      if (!Array.isArray(byteArray) && !(byteArray instanceof Uint8Array))
        throw new TypeError('encodedString is neither an Array nor Uint8Array')
      if (!Number.isInteger(radix)) throw new TypeError('radix is not an integer')
      if ((radix < 2 || radix > 36) && radix !== 64) throw new RangeError('radix is not between 2 and 36 or 64')

      if (radix === 64) {
        if (typeof btoa === 'undefined') return Buffer.from(byteArray).toString('base64')

        let binary = ''
        const chunk = 0x8000 // 32k chunks to avoid arg limit

        for (let i = 0; i < byteArray.length; i += chunk)
          binary += String.fromCharCode.apply(null, byteArray.subarray(i, i + chunk))

        return btoa(binary)
      }

      const chunkSize = Math.ceil(Math.log(256) / Math.log(radix))

      return Array.from(byteArray)
        .map((b) => b.toString(radix).padStart(chunkSize, '0'))
        .join('')
    }

    /**
     * Decodes an encoded string back into a {@link Uint8Array}.
     *
     * - For bases 2–36, the string is divided into fixed-size chunks
     *   (based on the radix) and each chunk is parsed back into a byte value.
     * - For radix 64, the input is assumed to be Base64-encoded and is decoded
     *   via {@link atob}.
     *
     * @param {string} encodedString - The encoded string to decode.
     * @param {number} radix - The numeric base used in the string (2–36, or 64 for Base64).
     * @returns {Uint8Array} The decoded byte array.
     *
     * @throws {TypeError} If `radix` is not an integer.
     * @throws {RangeError} If `radix` is outside the range 2–36 and not 64.
     *
     * @example
     * ```js
     * const encoded = "0fff80";
     * const decoded = ByteArrayConverter.decodeStringToByteArray(encoded, 16);
     * // Uint8Array [15, 255, 128]
     * ```
     */
    static decodeStringToByteArray(encodedString, radix) {
      if (typeof encodedString !== 'string') throw new TypeError('encodedString is not a string')
      if (!Number.isInteger(radix)) throw new TypeError('radix is not an integer')
      if ((radix < 2 || radix > 36) && radix !== 64) throw new RangeError('radix is not between 2 and 36 or 64')

      if (radix === 64) {
        if (typeof atob === 'undefined') return Uint8Array.from(Buffer.from(encodedString, 'base64'))

        return Uint8Array.from(atob(encodedString), (c) => c.charCodeAt(0))
      }

      const chunkSize = Math.ceil(Math.log(256) / Math.log(radix))
      const chunkCount = Math.ceil(encodedString.length / chunkSize)

      const result = new Uint8Array(chunkCount)
      const resultSize = chunkCount * chunkSize
      let resultIdx = 0

      for (let chunkIdx = 0; chunkIdx < resultSize; chunkIdx += chunkSize)
        result[resultIdx++] = parseInt(encodedString.slice(chunkIdx, chunkIdx + chunkSize), radix) || 0

      return result
    }
  }

  /**
   * @class TRA - Text Rotation Algorithm
   * @classdesc A lightweight symmetric text obfuscation utility that operates on UTF-8
   * encoded bytes. The algorithm applies a pseudo-randomized, index-dependent
   * rotation to each byte and encodes the result as a string in a configurable
   * radix (binary, decimal, hex, base36, or base64).
   *
   * The transformation is symmetric: calling {@link TRA.encrypt()} followed by
   * {@link TRA.decrypt()} (with the same radix) restores the original string.
   *
   * ### Key Features
   * - Works with any UTF-8 text input.
   * - Reversible rotation based on array length and index.
   * - Configurable output encoding via radix (2–36, or 64 for Base64).
   * - No external dependencies except for a `ByteArrayConverter` helper.
   *
   * @example
   * ```js
   * import TRA from './TRA.js'
   *
   * const plaintext = "Hello, world!"
   * const encrypted = TRA.encrypt(plaintext, 16)
   * const decrypted = TRA.decrypt(encrypted, 16)
   *
   * console.log(encrypted) // Encrypted hex string
   * console.log(decrypted) // "Hello, world!"
   * ```
   *
   * @license Copyright (c) 2025 Kyle Hoeckman, All rights reserved.
   */
  class TRA {
    /**
     * Encrypts a given string by encoding it to bytes, applying a
     * custom reversible rotation, and converting to a radix-based string.
     *
     * @static
     * @param {string} string - The plaintext string to encrypt.
     * @param {number} [radix] - The numeric base for output string encoding (2-36 or 64).
     * @returns {string} The encrypted string representation in the specified radix.
     *
     * @example
     * ```js
     * const encrypted = TRA.encrypt("Hello, world!", 16);
     * ```
     */
    static encrypt(string, radix) {
      let uint8Array = new TextEncoder().encode(string)
      uint8Array = TRA.#rotate(uint8Array, 1)
      return ByteArrayConverter.encodeByteArrayToString(uint8Array, radix)
    }

    /**
     * Decrypts an encrypted radix-based string back into the original plaintext.
     *
     * The method decodes the string into bytes, applies the inverse rotation,
     * and then decodes back to a UTF-8 string.
     *
     * @static
     * @param {string} string - The encrypted string to decrypt.
     * @param {number} [radix] - The numeric base used in the encrypted string (2-36 or 64).
     * @returns {string|Error} The decrypted plaintext string, or an Error if decryption fails.
     *
     * @example
     * ```js
     * const decrypted = TRA.decrypt(encrypted, 16);
     * ```
     */
    static decrypt(string, radix) {
      let uint8Array = ByteArrayConverter.decodeStringToByteArray(string, radix)
      uint8Array = TRA.#rotate(uint8Array, -1)
      return new TextDecoder().decode(uint8Array)
    }

    /**
     * Applies a reversible byte-wise rotation on a `Uint8Array`.
     *
     * Each byte is shifted by a pseudo-random offset that depends on its
     * index and the array length. The pseudo-random sequence is derived
     * from a hashed constant table and integer mixing operations.
     *
     * Because the transformation is symmetric under negation of `rotation`,
     * applying this method twice with `rotation = 1` and `rotation = -1`
     * restores the original array.
     *
     * @static
     * @param {Uint8Array} uint8Array - The input byte array to transform.
     * @param {number} rotation - Direction multiplier: `1` for encryption, `-1` for decryption.
     * @returns {Uint8Array} A new rotated `Uint8Array`.
     * @private
     */
    static #rotate(uint8Array, rotation) {
      if (!rotation) return uint8Array

      const len = uint8Array.length

      const K = new Uint32Array(256)

      for (let i = 0; i < 256; i++) {
        let x = i ^ (len * 0x45d8f3b)
        x = Math.imul(x ^ (x >>> 16), 0x27d4fb2d)
        x = Math.imul(x ^ (x >>> 15), 0x175667b1)
        x ^= x >>> 16
        K[i] = x
      }

      const result = new Uint8Array(len)

      for (let i = 0; i < len; i++) {
        let x = (i + 0x9e3769b9 * len + K[i & 0xff]) | 0
        x ^= x >>> 16
        x = Math.imul(x, 0x85ebba6b)
        x ^= x >>> 13
        x = Math.imul(x, 0xc3b2ae35)
        x ^= x >>> 16
        const offset = x & 0xff
        result[i] = (uint8Array[i] + offset * rotation) & 0xff
      }

      return result
    }
  }

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
  class StorageManager {
    static version = '1.6.2'

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
     * Must implement the standard Storage API (`getItem`, `setItem`).
     *
     * @throws {TypeError} Throws if `itemName` is not a string.
     * @throws {TypeError} Throws if `encryptFn` or `decryptFn` are defined but not functions.
     * @throws {TypeError} Throws if `storage` does not implement the standard Storage API.
     */
    constructor(
      itemName,
      {
        defaultValue,
        encryptFn = (value) => TRA.encrypt(value, 64),
        decryptFn = (value) => TRA.decrypt(value, 64),
        storage = window.localStorage,
      } = {}
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

      if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function')
        throw new TypeError('storage must implement the standard Storage API')

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
      if (typeof value !== 'string') value = '\0' + JSON.stringify(value)
      this.storage.setItem(this.itemName, this.encryptFn(value))
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
     * Retrieves and synchronizes the internal cache with the latest stored value.
     *
     * This method reads the raw value from the underlying storage, applies decryption
     * if configured, parses JSON-encoded objects (marked with a `\0` prefix),
     * and updates the internal cache (`#value`) accordingly.
     *
     * Unlike the {@link StorageManager.value|value} getter, this method always performs
     * a real storage read and decryption to ensure synchronization with external changes.
     *
     * @returns {*} The actual value, or the default value if none exists.
     */
    getItem() {
      let value = this.storage.getItem(this.itemName)
      if (typeof value !== 'string') return (this.#value = value ?? this.defaultValue)
      value = this.decryptFn(value)
      return (this.#value = value.startsWith('\0') ? JSON.parse(value.slice(1)) : value)
    }

    /**
     * Resets the stored value to the default value.
     */
    reset() {
      this.value = this.defaultValue
    }
  }

  exports.TRA = TRA
  exports.default = StorageManager

  Object.defineProperty(exports, '__esModule', { value: true })
})
