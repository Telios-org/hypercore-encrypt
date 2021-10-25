const test = require('brittle')
const { create, replicate, generateAEDKey } = require('./helpers')
const Hyperbee = require('hyperbee');

test('generate key when one is not passed in', async function (t) {
  const a = await create(null, {
    valueEncoding: 'json',
    skipFirstBlock: false
  })

  await a.append({ hello: 'world' })
  t.alike(await a.get(0), { hello: 'world' })
  t.is(await a.get(0, { valueEncoding: 'utf-8' }), '{"hello":"world"}')
})

test('pass in existing encryption key', async function (t) {
  const key = generateAEDKey();

  const a = await create(null, {
    encryptionKey: key,
    valueEncoding: 'json',
    skipFirstBlock: false
  })

  await a.append({ hello: 'world' })
  t.alike(await a.get(0), { hello: 'world' })
  t.is(await a.get(0, { valueEncoding: 'utf-8' }), '{"hello":"world"}')
})

test('replicate core with encryption key', async function (t) {
  const key = generateAEDKey();

  const a = await create(null, {
    encryptionKey: key,
    valueEncoding: 'json',
    skipFirstBlock: false
  })

  await a.append({ hello: 'world' })
  t.alike(await a.get(0), { hello: 'world' })
  t.is(await a.get(0, { valueEncoding: 'utf-8' }), '{"hello":"world"}')

  const b = await create(a.key, {
    encryptionKey: key,
    valueEncoding: 'json',
    skipFirstBlock: false
  });

  replicate(a, b, t)

  const r = b.download({ start: 0, end: a.length })

  await r.downloaded()

  t.alike(await b.get(0), { hello: 'world' })
  t.is(await b.get(0, { valueEncoding: 'utf-8' }), '{"hello":"world"}')
})

test('put/get data in Hyperbee', async function (t) {
  const key = generateAEDKey()

  const feed = await create(null, {
    encryptionKey: key,
    keyEncoding: 'utf-8',
    valueEncoding: 'utf-8'
  })

  const bee = new Hyperbee(feed, {
    keyEncoding: 'utf-8',
    valueEncoding: 'json'
  })

  await bee.put('hi', { hello: 'world' })

  const result = await bee.get('hi')

  t.alike(result.value, { hello: 'world' })
})