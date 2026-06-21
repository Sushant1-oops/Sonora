const express = require('express');
const router = express.Router();

const playlistController = require('../controllers/playlistController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

router.post('/', requireAuth, playlistController.create);
router.get('/me', requireAuth, playlistController.getMine);
router.get('/:id', optionalAuth, playlistController.getOne); 
router.patch('/:id', requireAuth, playlistController.update);
router.delete('/:id', requireAuth, playlistController.remove);

router.post('/:id/tracks', requireAuth, playlistController.addTrack);
router.delete('/:id/tracks/:trackId', requireAuth, playlistController.removeTrack);
router.patch('/:id/reorder', requireAuth, playlistController.reorder);

module.exports = router;
