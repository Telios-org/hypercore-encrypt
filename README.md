# hypercore-encrypt

Hypercore encrypt enables block encryption for [Hypercore v10](https://github.com/hypercore-protocol/hypercore) with authenticated encryption keys.

<!-- ``` sh
npm install @telios/hypercore-encrypt
``` -->

![Build Status](https://github.com/Telios-org/hypercore-encrypt/actions/workflows/test-node.yml/badge.svg)

## Usage
``` js
const Hypercore = require('@telios/hypercore-encrypt')

const feed = new Hypercore('./my-encrypted-dataset', { encryptionKey: key, valueEncoding: 'json' })

await feed.ready()

feed.append('hello world')
feed.get(0, console.log) // decrypts block 0 and prints hello world
```
## API
#### `const feed = new Hypercore(storage, [key], [options])`
Hypercore-encrypt mimics [Hypercore v10's](https://github.com/hypercore-protocol/hypercore/blob/master/README.md#api) API except an encryption key can be passed into the options to encrypt and decipher blocks. 

``` js
{
  encryptionKey: key // All blocks will be encrypted and deciphered with this AEAD key
}
```

```js
// Initializing a new feed without an encryption key will automatically generate a new one
const feed = new Hypercore('./my-encrypted-dataset', { valueEncoding: 'json' })

const key = feed.encryptionKey.tostring('hex')

// Initialize a new feed with an existing key
const feed = new Hypercore('./my-encrypted-dataset', { encryptionKey: key, valueEncoding: 'json' })

```

## License
MIT