const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const morgan = require('morgan');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const logger = require('./config/logger');

const authRoutes = require('./routes/authRoutes');
const musicRoutes = require('./routes/musicRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();



app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true, 
  })
);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(
  morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  })
);


app.get('/health', (req, res) => {
  res.json({ status: 'ok', instance: process.env.INSTANCE_ID || 'unknown' });
});


app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/users', userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
