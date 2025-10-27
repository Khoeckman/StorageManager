# @khoeckman/storagemanager

A lightweight wrapper for Storage-like interfaces (e.g., `localStorage` or `sessionStorage`) with **efficient caching**, **out-of-the-box encryption**, and **JSON support**. Perfect for fast, type-safe, and flexible client-side data management.

[![npm version](https://img.shields.io/npm/v/@khoeckman/storagemanager.svg)](https://www.npmjs.com/package/@khoeckman/storagemanager)
[![npm downloads](https://img.shields.io/npm/dt/@khoeckman/storagemanager.svg)](https://www.npmjs.com/package/@khoeckman/storagemanager)
[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/@khoeckman/storagemanager/badge)](https://www.jsdelivr.com/package/npm/@khoeckman/storagemanager)
[![License](https://img.shields.io/npm/l/@khoeckman/storagemanager.svg)](LICENSE)

---

## Features

- ⚡ **Fast caching**: memory cache avoids repeated storage reads.
- 🔒 **Optional encoding/decoding** hooks.
- 🧩 **JSON support**: automatically serializes and parses objects.
- 🌐 **Custom storage**: works with any object implementing the standard Storage API.
- 🔄 **Sync with external changes**: `sync()` ensures the cache reflects the actual stored value.
- 📝 **Default values** and reset functionality.

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

### Basic Example

```js
import StorageManager from '@khoeckman/storagemanager'

const userStore = new StorageManager('userSettings', {
  defaultValue: { theme: 'dark', language: 'en' },
  encodeFn: (value) => btoa(value), // optional encoding
  decodeFn: (value) => atob(value), // optional decoding
})

// Store a value
userStore.value = { theme: 'light' }

// After reloading the page:
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

### Resetting Values

```js
storage.reset()
console.log(storage.value) // back to default value
```

### Removing Values

Uses `Storage.removeItem()` internally to remove the item from storage and sets the cached value to `undefined`.

```js
storage.remove()
console.log(storage.value) // undefined
```

### Encrypting

If you want to make stored data significantly harder to reverse-engineer than with simple Base64 encoding (`btoa` / `atob`), you can use encryption methods such as **TRA** for `encodeFn` and `decodeFn`.

This is also the **default behavior**, if you don't specify your own encoding or decoding functions, `StorageManager` automatically uses `TRA.encrypt` and `TRA.decrypt` internally.

```js
import StorageManager, { TRA } from '@khoeckman/storagemanager'

const storage = new StorageManager('userSettings', {
  defaultValue: { theme: 'dark', language: 'en' },
  encodeFn: (value) => TRA.encrypt(value, 64), // same as default behavior
  decodeFn: (value) => TRA.decrypt(value, 64), // same as default behavior
})
```

### Disabling Encoding or Encryption

If you want to store values **as plain text**, without encryption or transformation, you can disable the encoding and decoding functions by passing a falsy value for `encodeFn` and `decodeFn`.

`StorageManager` will automatically fall back to **identity functions** (`value => value`), which means the data is written and read exactly as-is.

> ⚠️ Note: Objects are still automatically stringified. In that case, the stored string will be prefixed with `\x00JSON\x00 ` to mark it as JSON. This allows `StorageManager` to correctly parse it back into an object.

```js
const storage = new StorageManager('userSettings', {
  defaultValue: { theme: 'dark', language: 'en' },
  encodeFn: null, // disables encoding
  decodeFn: null, // disables decoding
})

storage.value = { theme: 'light' }
console.log(storage.storage) // Storage {userSettings: '\x00JSON\x00 {"theme":"light"}', length: 1}

storage.value = 'none'
console.log(storage.storage) // Storage {userSettings: 'none', length: 1}
```

This is useful for when you want your data to be **readable directly in storage**.

### Handling External Changes

If the underlying `Storage` (e.g., `localStorage` or `sessionStorage`) is modified without using `.value =`, the internal cache will **not automatically update**.

To synchronize the cached value with the stored data, call `sync()`. You can also provide a **custom decode function** if needed.

```js
// External change to storage (not recommended)
localStorage.setItem('userSettings', '{"theme":"blue"}')

// Resynchronize the cache, optionally with a custom decoder
userStore.sync((value) => JSON.parse(value))

console.log(userStore.value) // { theme: 'blue' }
console.log(userStore.storage) // Storage {userSettings: '\x00JSON\x00 {"theme":"blue"}', length: 1}
```

This ensures that the `StorageManager` instance reflects the current state of the storage.

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

- **Getter** — returns the cached value (fast).
- **Setter** — sets and caches the value, encoding and serializing if needed.

### `sync(decodeFn)`

- **decodeFn** _(optional)_ — a function to decode values when reading (defaults to `options.decodeFn`).
- Reads the value from storage.
- Decodes and parses JSON-encoded objects.
- Updates the internal cache.
- Returns the actual stored value or the default if missing.

### `reset()`

- Resets the stored value to its configured default.
- Updates both storage and internal cache.
- Returns the restored default value.

### `remove()`

- Removes the key and its value from the associated storage.
- Clears the internal cache.
- Returns nothing.

### `clear()`

- Clears **all keys** in the linked storage backend (`localStorage` or `sessionStorage`).
- Affects all stored data, not just this key.
- Returns nothing.

### `isDefault()`

- Checks whether the cached value equals the configured default.
- Uses reference comparison for objects and strict equality for primitives.
- Returns `true` if the current value matches the default, otherwise `false`.

```js
if (userStore.isDefault()) {
  console.log('value is equal to default.')
}
```

---

## TypeScript Usage

### `constructor<T, HasDefault extends boolean = false>(itemName, options)`

```ts
import StorageManager from '@khoeckman/storagemanager'

interface Settings {
  theme: 'dark' | 'light'
  language: string
}

const userStore = new StorageManager<Settings>('userSettings', {
  defaultValue: { theme: 'dark', language: 'en' },
})

// Property 'language' is missing in type '{ theme: "light"; }' but required in type 'Settings'. ts(2741)
userStore.value = { theme: 'light' }

const current = userStore.sync() // (method): T | undefined
// 'current' is possibly 'undefined'. ts(18048)
console.log(current.theme) // 'light'
```

The second error occurs because TypeScript cannot automatically infer that you provided a `defaultValue` of type `Settings`. By default, the `StorageManager` class treats `defaultValue` as optional, so its getter `value` or methods like `sync()` could potentially return `undefined`.

To inform TypeScript that a default value is guaranteed, you can set the second generic parameter `HasDefault` to `true`:

```js
const userStore = new StorageManager<Settings, true>('userSettings', {
  defaultValue: { theme: 'dark', language: 'en' },
})

const current = userStore.sync() // (method): T
// no error
console.log(current.theme) // 'light
```

---

## Source

[GitHub Repository](https://github.com/Khoeckman/StorageManager)

---

## License

MIT
