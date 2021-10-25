const test = require('brittle')
const { create } = require('./helpers')

test('encrypt encodings - supports built ins', async function (t) {
  const a = await create(null, { valueEncoding: 'json' })
  console.log(a.encryptionKey.toString('hex'))
  await a.append({ hello: 'world' })
  t.alike(await a.get(0), { hello: 'world' })
  t.is(await a.get(0, { valueEncoding: 'utf-8' }), '{"hello":"world"}')

  const b = await create(null, { valueEncoding: 'utf-8' })

  await b.append('foo')
  await b.append('bar')

  t.is(await b.get(0), 'foo')
  t.is(await b.get(1), 'bar')
})

test('encrypt encodings - supports custom encoding', async function (t) {
  const a = await create(null, { valueEncoding: { encode() { return Buffer.from('foo') }, decode() { return 'bar' } } })

  await a.append({ hello: 'world' })

  t.is(await a.get(0), 'bar')
  t.is(await a.get(0, { valueEncoding: 'utf-8' }), 'foo')
})