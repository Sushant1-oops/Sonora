import { createSlice } from '@reduxjs/toolkit';






const initialState = {
  queue: [], 
  originalQueue: [], 
  currentIndex: -1,
  isPlaying: false,
  volume: 0.8,
  isMuted: false,
  progress: 0, 
  duration: 0, 
  shuffle: false,
  repeatMode: 'off', 
  isLoading: false,
};

function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    
    
    
    playQueue(state, action) {
      const { tracks, startIndex = 0 } = action.payload;
      state.originalQueue = tracks;
      state.queue = state.shuffle ? shuffleArray(tracks) : tracks;
      state.currentIndex = state.shuffle
        ? state.queue.findIndex((t) => t.id === tracks[startIndex]?.id)
        : startIndex;
      state.isPlaying = true;
      state.progress = 0;
    },
    addToQueue(state, action) {
      state.queue.push(action.payload);
      state.originalQueue.push(action.payload);
    },
    playPause(state) {
      if (state.currentIndex === -1) return; 
      state.isPlaying = !state.isPlaying;
    },
    play(state) {
      if (state.currentIndex === -1) return;
      state.isPlaying = true;
    },
    pause(state) {
      state.isPlaying = false;
    },
    next(state) {
      if (state.queue.length === 0) return;

      if (state.repeatMode === 'one') {
        
        state.progress = 0;
        return;
      }

      const isLast = state.currentIndex >= state.queue.length - 1;

      if (isLast) {
        if (state.repeatMode === 'all') {
          state.currentIndex = 0;
        } else {
          state.isPlaying = false; 
        }
      } else {
        state.currentIndex += 1;
      }
      state.progress = 0;
    },
    previous(state) {
      if (state.queue.length === 0) return;

      
      
      if (state.progress > 3) {
        state.progress = 0;
        return;
      }

      const isFirst = state.currentIndex <= 0;
      if (isFirst) {
        state.currentIndex = state.repeatMode === 'all' ? state.queue.length - 1 : 0;
      } else {
        state.currentIndex -= 1;
      }
      state.progress = 0;
    },
    playTrackAtIndex(state, action) {
      state.currentIndex = action.payload;
      state.isPlaying = true;
      state.progress = 0;
    },
    setVolume(state, action) {
      state.volume = Math.max(0, Math.min(1, action.payload));
      state.isMuted = state.volume === 0;
    },
    toggleMute(state) {
      state.isMuted = !state.isMuted;
    },
    setProgress(state, action) {
      state.progress = action.payload;
    },
    setDuration(state, action) {
      state.duration = action.payload;
    },
    toggleShuffle(state) {
      state.shuffle = !state.shuffle;
      const currentTrack = state.queue[state.currentIndex];

      if (state.shuffle) {
        state.queue = shuffleArray(state.originalQueue);
      } else {
        state.queue = state.originalQueue;
      }

      
      if (currentTrack) {
        state.currentIndex = state.queue.findIndex((t) => t.id === currentTrack.id);
      }
    },
    cycleRepeatMode(state) {
      const modes = ['off', 'all', 'one'];
      const idx = modes.indexOf(state.repeatMode);
      state.repeatMode = modes[(idx + 1) % modes.length];
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    clearQueue(state) {
      Object.assign(state, initialState);
    },
  },
});

export const {
  playQueue,
  addToQueue,
  playPause,
  play,
  pause,
  next,
  previous,
  playTrackAtIndex,
  setVolume,
  toggleMute,
  setProgress,
  setDuration,
  toggleShuffle,
  cycleRepeatMode,
  setLoading,
  clearQueue,
} = playerSlice.actions;

export default playerSlice.reducer;


export const selectCurrentTrack = (state) => {
  const { queue, currentIndex } = state.player;
  return currentIndex >= 0 && currentIndex < queue.length ? queue[currentIndex] : null;
};
