const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dns = require('dns');
const validUrl = require('valid-url');
const Url = require('./models/Url');

require('dotenv').config();

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({extended: true}));
// Basic Configuration
const port = process.env.PORT || 3001;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

mongoose.connect(process.env.MONGO_URI ,{ useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected!'));

  
  app.get('/', function(req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });
  
  app.post('/api/shorturl', async (req, res) => {
    const originalUrl = req.body.url;

    if (!validUrl.isWebUri(originalUrl)) {
        return res.json({ error: 'invalid url' });
    }

    const urlObject = new URL(originalUrl);
    dns.lookup(urlObject.hostname, async (err) => {
        if (err) return res.json({ error: 'invalid url' });

        try {
            let url = await Url.findOne({ originalUrl });
            if (!url) {
                const shortUrl = await Url.countDocuments({}) + 1;
                url = new Url({ originalUrl, shortUrl });
                await url.save();
            }
            res.json({ original_url: url.originalUrl, short_url: url.shortUrl });
        } catch (err) {
            console.error(err);
            res.status(500).json('Server error');
        }
    });
});

app.get('/api/shorturl/:shortUrl', async (req, res) => {
    try {
        const url = await Url.findOne({ shortUrl: req.params.shortUrl });
        if (url) {
            return res.redirect(url.originalUrl);
        } else {
            return res.json({ error: 'No short URL found for the given input' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json('Server error');
    }
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
