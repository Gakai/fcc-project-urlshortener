const { join } = require('node:path')

const db = import('lowdb').then(async lowdb => {
  const { LowSync } = lowdb
  const { JSONFileSync } = await import('lowdb/node')
  const db = new LowSync(new JSONFileSync(join(__dirname, 'shorturl.json')))
  db.read()
  db.data ||= { nextId: 0, urls: {} }
  db.write()
  return db
})

module.exports = db