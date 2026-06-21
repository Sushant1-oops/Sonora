const express = require('express');
const router = express.Router();

const musicController = require('../controllers/musicController');
const { optionalAuth } = require('../middleware/auth');
const { searchLimiter } = require('../middleware/rateLimiter');






router.get('/search', searchLimiter, optionalAuth, musicController.search);
router.get('/popular', optionalAuth, musicController.getPopular);
router.get('/genres', musicController.getGenres);
router.get('/artists/:artistId/tracks', optionalAuth, musicController.getArtistTracks);
router.get('/tracks/:spotifyId', optionalAuth, musicController.getTrack);

module.exports = router;
