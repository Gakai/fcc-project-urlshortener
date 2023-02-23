// Boilerplate code from https://github.com/freeCodeCamp/boilerplate-project-urlshortener

const dns = require('node:dns')

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const db = require('./mockDatabase')

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.use(bodyParser.urlencoded({ extended: false }))

app.post('/api/shorturl', (req, res) => {
  const { url } = req.body
  dns.lookup(new URL(url).hostname, async err => {
    if (err) return res.status(400).json({ error: 'Invalid url', code: err.code })
    try {
      const data = (await db).data
      const short_url = data.nextId++
      data.urls[short_url] = url
        ; (await db).write()
      console.log(`Created shorturl ${short_url} for '${url}'`)
      return res.json({ original_url: url, short_url })
    } catch (err) {
      console.log('Error loading database:', err)
      return res.status(500).json({ error: 'Database connection failed.' })
    }
  })
})

app.all('/api/shorturl/:id?', async (req, res) => {
  const { id } = req.params
  if (!id) return res.status(404).send('Not found')
  try {
    const url = (await db).data.urls[id]
    if (!url) return res.status(404).json({ error: 'No short url found for the given input.' })
    return res.redirect(308, url)
  } catch (err) {
    console.log('Error loading database:', err)
    return res.status(500).json({ error: 'Database connection failed.' })
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
