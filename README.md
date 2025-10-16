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

const storage = new StorageManager('userSettings', {
  defaultValue: { theme: 'dark', language: 'en' },
  encryptFn: (value) => btoa(value), // optional encryption
  decryptFn: (value) => atob(value), // optional decryption
})

// Store and retrieve values
storage.value = { theme: 'light' }
console.log(storage.value) // { theme: 'light' }

// If the storage is modified externally:
localStorage.setItem('userSettings', '{"theme":"blue"}')
storage.getItem()
console.log(storage.value) // { theme: 'blue' }
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
const current = storage.getItem() // properly typed
```

---

## Source

[GitHub Repository](https://github.com/Khoeckman/StorageManager)

---

## License

MIT
