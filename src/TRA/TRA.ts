import ByteArrayConverter, { type Radix } from './ByteArrayConverter'

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
export default class TRA {
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
  static encrypt(string: string, radix: Radix = 64): string {
    let uint8Array = new TextEncoder().encode(string) as Uint8Array
    uint8Array = this.#rotate(uint8Array, 1)
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
  static decrypt(string: string, radix: Radix = 64): string {
    let uint8Array = ByteArrayConverter.decodeStringToByteArray(string, radix)
    uint8Array = this.#rotate(uint8Array, -1)
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
  static #rotate(uint8Array: Uint8Array, rotation: number): Uint8Array {
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
