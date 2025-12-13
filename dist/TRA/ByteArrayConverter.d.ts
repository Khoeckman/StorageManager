export type Radix = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 64;
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
    static encodeByteArrayToString(byteArray: Uint8Array | number[], radix: Radix): string;
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
    static decodeStringToByteArray(encodedString: string, radix: Radix): Uint8Array;
}
