const mongoose = require('mongoose');

const UrlSchema = new mongoose.Schema({
    originalUrl: {
        type: String,
        required: true,
    },
    shortUrl: {
        type: Number,
        required: true,
    }
});

module.exports = mongoose.model('Url', UrlSchema);