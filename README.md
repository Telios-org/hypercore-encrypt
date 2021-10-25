# hypercore-encrypt

Hypercore encrypt enables block encryption for [Hypercore v10](https://github.com/hypercore-protocol/hypercore) with authenticated encryption keys.

``` sh
npm i hypercore-encrypt
```

![Build Status](https://github.com/Telios-org/hypercore-encrypt/actions/workflows/test-node.yml/badge.svg)

## Usage
``` js
const Hypercore = require('hypercore-encrypt')

const feed = new Hypercore('./my-encrypted-dataset', null, { 
  encryptionKey: key, 
  valueEncoding: 'json',
  skipFirstBlock: false // remove this option if the feed is being used in something like Hyperbee
})

await feed.ready()

feed.append('hello world')
feed.get(0, console.log) // decrypts block 0 and prints hello world
```
## API
#### `const feed = new Hypercore(storage, [key], [options])`
Hypercore-encrypt mimics [Hypercore v10's](https://github.com/hypercore-protocol/hypercore/blob/master/README.md#api) API except an encryption key can be passed into the options to encrypt and decipher blocks. 

``` js
{
  encryptionKey: key, // All blocks will be encrypted and deciphered with this AEAD key
  skipFirstBlock: true // Skip encrypting the header block when using this in conjunction with something like Hyperbee
}
```

```js
// Initializing a new feed without an encryption key will automatically generate a new one
const feed = new Hypercore('./my-encrypted-dataset', null, { valueEncoding: 'json' })

const key = feed.encryptionKey.tostring('hex')

// Initialize a new feed with an existing key
const feed = new Hypercore('./my-encrypted-dataset', null, { encryptionKey: key, valueEncoding: 'json' })

```

## License
MIT