# @khoeckman/storagemanager

A lightweight wrapper for Storage-like interfaces (e.g., `localStorage` or `sessionStorage`) with **efficient caching**, **out-of-the-box encryption**, and **JSON support**. Perfect for fast, type-safe, and flexible client-side data management.

[![npm version](https://img.shields.io/npm/v/@khoeckman/storagemanager.svg)](https://www.npmjs.com/package/@khoeckman/storagemanager)
[![License](https://img.shields.io/npm/l/@khoeckman/storagemanager.svg)](LICENSE)

---

## Features

- ⚡ **Fast caching**: memory cache avoids repeated storage reads.
- 🔒 **Optional encryption/decryption** hooks.
- 🧩 **JSON support**: automatically serializes and parses objects.
- 🌐 **Custom storage**: works with any object implementing the standard Storage API.
- 🔄 **Sync with external changes**: `getItem()` ensures the cache reflects the actual stored value.
- 📝 **Default values** and reset functionality.

---

## Installation

```bash
npm install @khoeckman/storagemanager
# or
pnpm add @khoeckman/storagemanager
# or
yarn add @khoeckman/storagemanager
```

---

## Usage

### Basic Example

```js
import StorageManager from '@khoeckman/storagemanager'

const userSettingsStorage = new StorageManager('userSettings', {
  defaultValue: { theme: 'dark', language: 'en' },
  encodeFn: (value) => btoa(value), // optional encoding
  decodeFn: (value) => atob(value), // optional decoding
})

// Store a value
userSettingsStorage.value = { theme: 'light' }

// After reloading the page:
console.log(userSettingsStorage.value) // { theme: 'light' }
```

### Using Custom Storage

```js
import StorageManager from '@khoeckman/storagemanager'

const sessionStore = new StorageManager('tempData', {
  storage: window.sessionStorage,
  defaultValue: 'none',
})

sessionStore.value = 'temporary'
console.log(sessionStore.value) // 'temporary'
```

### Resetting Values

```js
storage.reset()
console.log(storage.value) // back to default value
```

### Encrypting (TRA)

If you want to make stored data significantly harder to reverse-engineer than with simple Base64 encoding (`btoa` / `atob`), you can integrate a stronger encryption method such as **TRA**.

This is also the **default behavior**, if you don't specify your own encryption or decryption functions, `StorageManager` automatically uses `TRA.encrypt` and `TRA.decrypt` internally.

```js
import StorageManager from '@khoeckman/storagemanager'
import TRA from '@khoeckman/storagemanager/TRA'

const storage = new StorageManager('userSettings', {
  defaultValue: { theme: 'dark', language: 'en' },
  encryptFn: (value) => TRA.encrypt(value, 64),
  decryptFn: (value) => TRA.decrypt(value, 64),
})
```

### Disabling Encoding

If you want to store data in plain text for performance or usability, simply pass a falsy value for `encryptFn` and `decryptFn`.  
`StorageManager` will then fall back to identity functions (`(value) => value`).

```js
const storage = new StorageManager('userSettings', {
  defaultValue: { theme: 'dark', language: 'en' },
  encryptFn: null,
  decryptFn: null,
})
```

### External changes

When the `Storage` is modified externally, it is required to run `getItem()` to sync the value.

```js
localStorage.setItem('userSettings', '{"theme":"blue"}')
storage.getItem((value) => JSON.parse(value)) // custom decode function
console.log(storage.value) // { theme: 'blue' }
```

---

## API

### `constructor(itemName, options)`

- **itemName**: `string` — key under which the data is stored.
- **options** (optional):
  - `defaultValue` — default value if none exists.
  - `encryptFn` — function to encrypt values before saving.
  - `decryptFn` — function to decrypt values when reading.
  - `storage` — custom storage object implementing `getItem` and `setItem`.

### `value`

- **Getter**: returns the cached value (fast).
- **Setter**: sets and caches the value, encrypting and serializing if needed.

### `getItem()`

- Reads the value from storage.
- Decrypts and parses JSON-encoded objects.
- Updates the internal cache.
- Returns the actual stored value or default if missing.

### `reset()`

- Resets the value to the default.

---

## TypeScript Usage

```ts
import StorageManager from '@khoeckman/storagemanager'

interface Settings {
  theme: 'dark' | 'light'
  language: string
}

const storage = new StorageManager<Settings>('userSettings', {
  defaultValue: { theme: 'dark', language: 'en' },
})

storage.value.theme = 'light' // type-safe
console.log(storage.value.theme) // 'light'

const current = storage.getItem() // properly typed
console.log(current.theme) // 'light'
```

---

## Source

[GitHub Repository](https://github.com/Khoeckman/StorageManager)

---

## License

MIT
