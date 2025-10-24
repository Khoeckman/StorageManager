/**
 * @class TRA - Text Rotation Algorithm
 * @classdesc A lightweight symmetric text obfuscation utility that operates on UTF-8 encoded bytes.
 * The transformation is symmetric: calling `encrypt()` followed by `decrypt()` restores the original string.
 */
export default class TRA {
  /**
   * Encrypts a given string by encoding it to bytes, applying a custom reversible rotation,
   * and converting to a radix-based string.
   *
   * @param string - The plaintext string to encrypt.
   * @param radix - The numeric base for output string encoding (2–36 or 64 for Base64).
   * @returns The encrypted string representation in the specified radix.
   */
  static encrypt(string: string, radix?: number): string

  /**
   * Decrypts an encrypted radix-based string back into the original plaintext.
   *
   * @param string - The encrypted string to decrypt.
   * @param radix - The numeric base used in the encrypted string (2–36 or 64 for Base64).
   * @returns The decrypted plaintext string.
   */
  static decrypt(string: string, radix?: number): string

  /**
   * Applies a reversible byte-wise rotation on a `Uint8Array`.
   *
   * @param uint8Array - The input byte array to transform.
   * @param rotation - Direction multiplier: `1` for encryption, `-1` for decryption.
   * @returns A new rotated `Uint8Array`.
   * @private
   */
  static #rotate(uint8Array: Uint8Array, rotation: number): Uint8Array
}
