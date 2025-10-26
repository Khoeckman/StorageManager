'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true,
})

class ByteArrayConverter {
  static encodeByteArrayToString(byteArray, radix) {
    if (!Array.isArray(byteArray) && !(byteArray instanceof Uint8Array))
      throw new TypeError('encodedString is neither an Array nor Uint8Array')
    if (!Number.isInteger(radix)) throw new TypeError('radix is not an integer')
    if ((radix < 2 || radix > 36) && radix !== 64) throw new RangeError('radix is not between 2 and 36 or 64')
    if (!(byteArray instanceof Uint8Array)) byteArray = new Uint8Array(byteArray)
    if (radix === 64) {
      if (typeof btoa === 'undefined') return Buffer.from(byteArray).toString('base64')
      let binary = ''
      const chunk = 32768
      for (let i = 0; i < byteArray.length; i += chunk)
        binary += String.fromCharCode(...byteArray.subarray(i, i + chunk))
      return btoa(binary)
    }
    const chunkSize = Math.ceil(Math.log(256) / Math.log(radix))
    return Array.from(byteArray)
      .map((b) => b.toString(radix).padStart(chunkSize, '0'))
      .join('')
  }
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

class TRA {
  static encrypt(string, radix = 64) {
    let uint8Array = new TextEncoder().encode(string)
    uint8Array = this.#rotate(uint8Array, 1)
    return ByteArrayConverter.encodeByteArrayToString(uint8Array, radix)
  }
  static decrypt(string, radix = 64) {
    let uint8Array = ByteArrayConverter.decodeStringToByteArray(string, radix)
    uint8Array = this.#rotate(uint8Array, -1)
    return new TextDecoder().decode(uint8Array)
  }
  static #rotate(uint8Array, rotation) {
    if (!rotation) return uint8Array
    const len = uint8Array.length
    const K = new Uint32Array(256)
    for (let i = 0; i < 256; i++) {
      let x = i ^ (len * 73240379)
      x = Math.imul(x ^ (x >>> 16), 668269357)
      x = Math.imul(x ^ (x >>> 15), 391538609)
      x ^= x >>> 16
      K[i] = x
    }
    const result = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      let x = (i + 2654431673 * len + K[i & 255]) | 0
      x ^= x >>> 16
      x = Math.imul(x, 2246818411)
      x ^= x >>> 13
      x = Math.imul(x, 3283267125)
      x ^= x >>> 16
      const offset = x & 255
      result[i] = (uint8Array[i] + offset * rotation) & 255
    }
    return result
  }
}

class StorageManager {
  static version = '3.0.0'
  itemName
  defaultValue
  encodeFn
  decodeFn
  storage
  #value
  constructor(itemName, options = {}) {
    const {
      defaultValue: defaultValue,
      encodeFn: encodeFn = (value) => TRA.encrypt(value, 64),
      decodeFn: decodeFn = (value) => TRA.decrypt(value, 64),
      storage: storage = window.localStorage,
    } = options
    if (typeof itemName !== 'string') throw new TypeError('itemName is not a string')
    this.itemName = itemName
    this.defaultValue = defaultValue
    if (encodeFn && typeof encodeFn !== 'function') throw new TypeError('encodeFn is defined but is not a function')
    this.encodeFn = encodeFn || ((v) => v)
    if (decodeFn && typeof decodeFn !== 'function') throw new TypeError('decodeFn is defined but is not a function')
    this.decodeFn = decodeFn || ((v) => v)
    if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function')
      throw new TypeError('storage must implement the standard Storage API')
    this.storage = storage
    if (this.getItem() === undefined) this.reset()
  }
  set value(value) {
    this.#value = value
    const stringValue = typeof value === 'string' ? value : '\0JSON\0 ' + JSON.stringify(value)
    this.storage.setItem(this.itemName, this.encodeFn(stringValue))
  }
  get value() {
    return this.#value
  }
  getItem(decodeFn = this.decodeFn) {
    let value = this.storage.getItem(this.itemName)
    if (typeof value !== 'string') return (this.#value = value ?? this.defaultValue)
    value = decodeFn(value)
    return (this.#value = value.startsWith('\0JSON\0 ') ? JSON.parse(value.slice(7)) : value)
  }
  reset() {
    return (this.value = this.defaultValue)
  }
}

exports.ByteArrayConverter = ByteArrayConverter

exports.TRA = TRA

exports.default = StorageManager
