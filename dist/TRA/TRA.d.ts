import { type Radix } from './ByteArrayConverter';
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
    #private;
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
    static encrypt(string: string, radix?: Radix): string;
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
    static decrypt(string: string, radix?: Radix): string;
}
