const express = require('express');
const router = express.Router();

const libraryController = require('../controllers/libraryController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth); 

router.post('/likes', libraryController.likeTrack);
router.delete('/likes/:trackId', libraryController.unlikeTrack);
router.get('/likes', libraryController.getLikedTracks);

router.post('/recently-played', libraryController.recordPlay);
router.get('/recently-played', libraryController.getRecentlyPlayed);

router.post('/follows', libraryController.followArtist);
router.delete('/follows/:artistName', libraryController.unfollowArtist);
router.get('/follows', libraryController.getFollowedArtists);

module.exports = router;
