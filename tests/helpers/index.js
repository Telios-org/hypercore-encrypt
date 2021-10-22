const Hypercore = require('../..')
const ram = require('random-access-memory')
const sodium = require('sodium-native')

module.exports = {
  async create(...args) {
    const core = new Hypercore(ram, ...args)
    await core.ready()
    return core
  },

  replicate(a, b, t) {
    const s1 = a.replicate(true)
    const s2 = b.replicate(false)
    s1.on('error', err => t.comment(`STREAM ERROR: ${err}`))
    s2.on('error', err => t.comment(`STREAM ERROR: ${err}`))
    s1.pipe(s2).pipe(s1)
    return [s1, s2]
  },

  async eventFlush() {
    await new Promise(resolve => setImmediate(resolve))
  },

  generateAEDKey() {
    let k = Buffer.alloc(sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES)
    sodium.crypto_aead_xchacha20poly1305_ietf_keygen(k)
    return k
  }
}