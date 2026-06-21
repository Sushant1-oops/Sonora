import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPopular, fetchGenres, setActiveGenre } from '../../features/search/searchSlice';
import { fetchRecentlyPlayed } from '../../features/library/librarySlice';
import TrackCard from '../../components/TrackCard';

export default function HomePage() {
  const dispatch = useDispatch();
  const { popular, genres, activeGenre } = useSelector((state) => state.search);
  const { recentlyPlayed } = useSelector((state) => state.library);
  const isAuthenticated = useSelector((state) => !!state.auth.user);

  useEffect(() => {
    dispatch(fetchGenres());
    dispatch(fetchPopular(activeGenre));
  }, [dispatch, activeGenre]);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchRecentlyPlayed());
  }, [isAuthenticated, dispatch]);

  const recentTracks = recentlyPlayed.map((r) => r.track).filter(Boolean);

  return (
    <div className="pt-6 flex flex-col gap-8">
      <section className="flex gap-2.5 flex-wrap">
        <button
          className={`px-[18px] py-2 rounded-full text-[0.85rem] font-semibold transition-colors ${
            !activeGenre ? 'bg-accent text-[#1a0f0a]' : 'bg-elevated text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => dispatch(setActiveGenre(null))}
        >
          All
        </button>
        {genres.map((g) => (
          <button
            key={g}
            className={`px-[18px] py-2 rounded-full text-[0.85rem] font-semibold transition-colors ${
              activeGenre === g ? 'bg-accent text-[#1a0f0a]' : 'bg-elevated text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => dispatch(setActiveGenre(g))}
          >
            {g.charAt(0).toUpperCase() + g.slice(1)}
          </button>
        ))}
      </section>

      {isAuthenticated && recentTracks.length > 0 && (
        <section>
          <h2 className="text-[1.3rem] font-bold mb-4">Recently played</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-[18px]">
            {recentTracks.slice(0, 6).map((track, i) => (
              <TrackCard key={`${track.spotifyId}-${i}`} track={track} index={i} queueContext={recentTracks} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-[1.3rem] font-bold mb-4">
          {activeGenre ? `Popular in ${activeGenre}` : 'Popular right now'}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-[18px]">
          {popular.map((track, i) => (
            <TrackCard key={`${track.spotifyId}-${i}`} track={track} index={i} queueContext={popular} />
          ))}
        </div>
        {popular.length === 0 && <p className="text-text-muted">No tracks found. Try a different genre.</p>}
      </section>
    </div>
  );
}
