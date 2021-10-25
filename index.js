const Hypercore = require('hypercore')
const codecs = require('codecs')
const c = require('compact-encoding')
const sodium = require('sodium-native')

class HypercoreEncrypt extends Hypercore {
  constructor(storage, key, opts = {}) {
    super(storage, key, opts)

    this.encryptionKey = !opts.encryptionKey ? this._generateAEDKey() : opts.encryptionKey
    this.skipFirstBlock = typeof opts.skipFirstBlock === 'boolean' ? opts.skipFirstBlock : true

    if (!Buffer.isBuffer(this.encryptionKey)) {
      this.encryptionKey = Buffer.from(this.encryptionKey, 'hex')
    }
  }

  async get(index, opts) {
    if (this.opened === false) await this.opening
    const encoding = (opts && opts.valueEncoding && c.from(codecs(opts.valueEncoding))) || this.valueEncoding

    if (this.core.bitfield.get(index)) return this._decode(encoding, await this.core.blocks.get(index), this.encryptionKey)
    if (opts && opts.onwait) opts.onwait(index)

    return this._decode(encoding, await this.replicator.requestBlock(index), this.encryptionKey)
  }

  async append(blocks) {
    if (this.opened === false) await this.opening
    if (this.writable === false) throw new Error('Core is not writable')

    const blks = Array.isArray(blocks) ? blocks : [blocks]
    const buffers = new Array(blks.length)

    for (let i = 0; i < blks.length; i++) {
      let buf = this._encrypt(blks[i], this.encryptionKey)

      if (!Buffer.isBuffer(blks[i])) {
        buf = this._encrypt(c.encode(this.valueEncoding, blks[i]).toString(), this.encryptionKey)
      }

      buffers[i] = buf
    }

    return await this.core.append(buffers, this.sign)
  }

  _decode(enc, buf, k) {
    buf = this._decrypt(buf, k)
    return enc ? c.decode(enc, buf) : buf
  }

  _generateAEDKey() {
    let k = Buffer.alloc(sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES)
    sodium.crypto_aead_xchacha20poly1305_ietf_keygen(k)
    return k
  }

  _encrypt(msg, key) {
    if (this.skipFirstBlock && this.length === 0) {
      console.log(msg.toString())
      return msg
    }

    // if (msg.toString().indexOf('hyperbee') > -1) return msg

    let m = typeof msg === 'object' && !Buffer.isBuffer(msg) ? Buffer.from(JSON.stringify(msg)) : Buffer.from(msg, 'utf-8')

    let c = Buffer.alloc(m.length + sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES)
    let nonce = Buffer.alloc(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES)
    let k = Buffer.from(key, 'hex')

    sodium.randombytes_buf(nonce)

    sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(c, m, null, null, nonce, k)

    let encrypted = Buffer.from([])
    encrypted = Buffer.concat([nonce, c], sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES + c.length)

    return encrypted
  }

  _decrypt(c, k) {
    // slice nonce out of the encrypted message
    let nonce = c.slice(0, sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES)
    let cipher = c.slice(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES, c.length)

    let m = Buffer.alloc(cipher.length - sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES)

    sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(m, null, cipher, null, nonce, k)

    return m
  }
}

module.exports = HypercoreEncrypt