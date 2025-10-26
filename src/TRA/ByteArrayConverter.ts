/* prettier-ignore*/
export type Radix =
        2 |  3 |  4 |  5 |  6 |  7 |  8 |  9 | 10 |
  11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 |
  21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 |
  31 | 32 | 33 | 34 | 35 | 36 |
  64;

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
export default class ByteArrayConverter {
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
  static encodeByteArrayToString(byteArray: Uint8Array | number[], radix: Radix): string {
    if (!Array.isArray(byteArray) && !(byteArray instanceof Uint8Array))
      throw new TypeError('encodedString is neither an Array nor Uint8Array')
    if (!Number.isInteger(radix)) throw new TypeError('radix is not an integer')
    if ((radix < 2 || radix > 36) && radix !== 64) throw new RangeError('radix is not between 2 and 36 or 64')

    if (!(byteArray instanceof Uint8Array)) byteArray = new Uint8Array(byteArray)

    if (radix === 64) {
      if (typeof btoa === 'undefined') return Buffer.from(byteArray).toString('base64')

      let binary = ''
      const chunk = 0x8000 // 32k chunks to avoid arg limit

      for (let i = 0; i < byteArray.length; i += chunk)
        binary += String.fromCharCode(...byteArray.subarray(i, i + chunk))

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
  static decodeStringToByteArray(encodedString: string, radix: Radix): Uint8Array {
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
