# StorageManager for JavaScript/TypeScript

A lightweight wrapper for Storage interfaces (e.g., `localStorage` or `sessionStorage`) with **efficient caching**, **out-of-the-box encryption**, and **JSON support**. Perfect for easy, fast and type-safe client-side data management.

The biggest burdens of working with the **Storage API** is verifying values on every read, providing proper default values and only being able to store strings. This package eliminates all of that by providing a safe and automatic wrapper that handles everything at once. You can read/store numbers and objects without any extra steps.

[![npm version](https://img.shields.io/npm/v/@khoeckman/storagemanager.svg)](https://www.npmjs.com/package/@khoeckman/storagemanager)
[![npm downloads](https://img.shields.io/npm/dt/@khoeckman/storagemanager.svg)](https://www.npmjs.com/package/@khoeckman/storagemanager)
[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/@khoeckman/storagemanager/badge)](https://www.jsdelivr.com/package/npm/@khoeckman/storagemanager)
[![License](https://img.shields.io/npm/l/@khoeckman/storagemanager.svg)](LICENSE)

---

## Features

- 📝 **Default values** and reset functionality.
- 🧩 **JSON support**: automatically serializes and parses objects or non-string primitives.
- ⚡ **Fast caching**: memory cache avoids repeated storage reads.
- 🔒 **Optional encoding/decoding** hooks to obfuscate data.
- 🌐 **Custom storage**: works with any object implementing the standard Storage API.

---

## Installation

```bash
# npm
npm install @khoeckman/storagemanager

# pnpm
pnpm add @khoeckman/storagemanager

# yarn
yarn add @khoeckman/storagemanager
```

---

## Usage

### Basic

```js
import StorageManager from '@khoeckman/storagemanager'

const userStore = new StorageManager('userSettings', {
  defaultValue: { theme: 'dark', language: 'en' },
})

// Before setting a value the default value will be applied
console.log(userStore.value) // { theme: 'dark', language: 'en' }

// Store a value
userStore.value = { theme: 'light' }

// After reloading the page:
console.log(userStore.value) // { theme: 'light' }
console.log(userStore.value.theme) // 'light'
console.log(userStore.storage) // Storage {userSettings: 'AEpTT04AIHsidGhlbWUiOiJsaWdodCJ9', length: 1}
```

### Using Custom Storage

```js
import StorageManager from '@khoeckman/storagemanager'

const sessionStore = new StorageManager('sessionData', {
  defaultValue: 'none',
  storage: window.sessionStorage,
})

sessionStore.value = 'temporary'
console.log(sessionStore.value) // 'temporary'
console.log(sessionStore.storage) // Storage {sessionData: 'hN0IEUdoqmJ/', length: 1}
```

### Using Encoding and Decoding Functions

If you want to make stored data significantly harder to reverse-engineer, you should use the `encodeFn` and `decodeFn` options.

The default values for these are:

```js
encodeFn: (value) => StorageManager.TRA.encrypt(value, 64)
decodeFn: (value) => StorageManager.TRA.decrypt(value, 64)
```

But you can also apply your own, such as Base64 encoding:

```js
import StorageManager from '@khoeckman/storagemanager'

const sessionStore = new StorageManager('sessionData', {
  defaultValue: 'none',
  encodeFn: (value) => btoa(value),
  decodeFn: (value) => atob(value),
})

sessionStore.value = 'temporary'
console.log(sessionStore.value) // 'temporary'
console.log(sessionStore.storage) // Storage {sessionData: 'hN0IEUdoqmJ/', length: 1}
```

### Resetting Values

```js
store.reset()
console.log(store.value) // back to default value
```

### Removing Values

Internally uses `Storage.removeItem()` to remove the item from storage and sets the cached value to `undefined`.

```js
store.remove()
console.log(store.value) // undefined
console.log(store.storage) // Storage {length: 0}
```

### Disabling Encoding

If you want to store values **as plain text**, without encoding, you can **disable** the encoding and decoding functions by passing a **falsy value** for `encodeFn` and `decodeFn`.

In that case `StorageManager` will automatically fall back to **identity functions** (`value => value`), which means the data is written and read exactly as-is.

> ⚠️ Objects are still automatically stringified by the Storage API as they can only store strings. Incase `value` is not a string, StorageManager will `JSON.encode` the value into a string and prefix it with `\x00JSON\x00 ` to mark it as JSON so it can be **automatically parsed back** into its original state.

```js
const userStore = new StorageManager('userSettings', {
  defaultValue: { theme: 'dark', language: 'en' },
  encodeFn: null, // disables encoding
  decodeFn: null, // disables decoding
})

userStore.value = { theme: 'light' }
console.log(userStore.storage) // Storage {userSettings: '\x00JSON\x00 {"theme":"light"}', length: 1}

userStore.value = 'none'
console.log(userStore.storage) // Storage {userSettings: 'none', length: 1}
```

This is useful for when you want your data to be **readable directly in storage**.

---

## TypeScript Usage

### `constructor<T, DefaultValue extends T | undefined = T | undefined>(itemName, options)`

`T` = type of `value`
`DefaultValue` = type of the `defaultValue` key in the `options` parameter, can be `undefined` by default.

### Using `T`

```ts
import StorageManager from '@khoeckman/storagemanager'

interface Settings {
  theme: 'dark' | 'light'
  language: string
}

const defaultValue: Settings = { theme: 'dark', language: 'en' }
const userStore = new StorageManager<Settings>('userSettings', { defaultValue })

// Property 'language' is missing in type '{ theme: "light"; }' but required in type 'Settings'. ts(2741)
userStore.value = { theme: 'light' }

const current = userStore.sync() // (method): Settings | undefined
// 'current' is possibly 'undefined'. ts(18048)
console.log(current.theme) // { theme: 'light' }
```

### Using `T` and `DefaultValue`

The second error occurs because TypeScript cannot automatically infer that you provided a `defaultValue` of type `Settings`. By default, the `StorageManager` class treats `defaultValue` as optional, so its getter `value` or methods like `sync()` could potentially return `undefined`.

To inform TypeScript that a default value is guaranteed, you can set the second generic parameter `DefaultValue` to the type of whatever you passed as `defaultValue`:

```ts
const defaultValue: Settings = { theme: 'dark', language: 'en' }
const userStore = new StorageManager<Settings, typeof defaultValue>('userSettings', {
  defaultValue,
})

const current = userStore.sync() // (method): Settings
// no error
console.log(current.theme) // { theme: 'dark', language: 'en' }
```

---

## API

### `constructor(itemName, options)`

- **itemName**: `string` — key under which the data is stored.
- **options** _(optional)_:
  - `defaultValue` — default value to be stored if none exists.
  - `encodeFn` — function to encode values before writing to the `Storage`.
  - `decodeFn` — function to decode values when reading from the `Storage`.
  - `storage` — a `Storage` instance (e.g., `localStorage` or `sessionStorage`).

### `value`

- **Getter** — returns the cached value (very fast).
- **Setter** — sets and caches the value, serializing and encoding it.

### `reset()`

- Resets the stored value to `defaultValue`.
- Updates both `Storage` and internal cache.
- Returns the restored default value.

### `remove()`

- Removes the key and its value from the associated storage.
- Clears the internal cache.
- Returns nothing.

### `clear()`

- Clears **all keys** in the linked `Storage`.
- Affects all stored data, not just this key.
- Returns nothing.

### `isDefault()`

- Checks whether the cached value equals the configured default.
- Uses reference comparison for objects and strict equality for primitives.
- Returns `true` if the current value matches the default, otherwise `false`.

```js
if (userStore.isDefault()) {
  console.log('value equals the default value.')
}
```

### `sync(decodeFn)`

If the underlying `Storage` is not modified through `StorageManager.value`, the internal cache will **not automatically update**. This is where `sync()` comes in.

- **decodeFn** _(optional)_ — a function to decode values when reading (defaults to `options.decodeFn`).
- Reads the value from storage.
- Decodes and parses JSON-encoded objects.
- Updates the internal cache.
- Returns the actual stored value or the default if missing.

```js
// External change to storage (to be avoided)
localStorage.setItem('userSettings', '{"theme":"blue"}')

// Resynchronize the cache, optionally with a custom decoder
userStore.sync((value) => JSON.parse(value))

console.log(userStore.value) // { theme: 'blue' }
console.log(userStore.storage) // Storage {userSettings: '\x00JSON\x00 {"theme":"blue"}', length: 1}
```

---

## Source

[GitHub Repository](https://github.com/Khoeckman/StorageManager)

---

## License

MIT
