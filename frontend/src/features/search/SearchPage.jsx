import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search as SearchIcon } from 'lucide-react';
import { setQuery, searchTracks, searchArtists, clearResults } from '../../features/search/searchSlice';
import { useDebounce } from '../../hooks/useDebounce';
import TrackRow from '../../components/TrackRow';

export default function SearchPage() {
  const dispatch = useDispatch();
  const { query, trackResults, artistResults, status } = useSelector((state) => state.search);
  const [tab, setTab] = useState('tracks');
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      dispatch(clearResults());
      return;
    }
    dispatch(searchTracks({ query: debouncedQuery }));
    dispatch(searchArtists(debouncedQuery));
  }, [debouncedQuery, dispatch]);

  return (
    <div className="pt-6 flex flex-col gap-6">
      <div className="relative max-w-[440px]">
        <SearchIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          className="w-full pl-11 pr-4 py-3.5 rounded-full bg-elevated text-[0.95rem] focus:outline-2 focus:outline-accent"
          placeholder="What do you want to listen to?"
          value={query}
          onChange={(e) => dispatch(setQuery(e.target.value))}
          autoFocus
        />
      </div>

      {query.trim() && (
        <>
          <div className="flex gap-2">
            <button
              className={`px-[18px] py-2 rounded-full text-[0.85rem] font-semibold ${
                tab === 'tracks' ? 'bg-text-primary text-bg' : 'bg-elevated text-text-secondary'
              }`}
              onClick={() => setTab('tracks')}
            >
              Songs
            </button>
            <button
              className={`px-[18px] py-2 rounded-full text-[0.85rem] font-semibold ${
                tab === 'artists' ? 'bg-text-primary text-bg' : 'bg-elevated text-text-secondary'
              }`}
              onClick={() => setTab('artists')}
            >
              Artists
            </button>
          </div>

          {tab === 'tracks' && (
            <div className="flex flex-col gap-0.5">
              {status === 'loading' && <p className="text-text-muted py-4">Searching…</p>}
              {status !== 'loading' && trackResults.length === 0 && (
                <p className="text-text-muted py-4">No songs found for "{debouncedQuery}"</p>
              )}
              {trackResults.map((track, i) => (
                <TrackRow key={track.spotifyId} track={track} index={i} queueContext={trackResults} />
              ))}
            </div>
          )}

          {tab === 'artists' && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 sm:gap-5">
              {artistResults.length === 0 && (
                <p className="text-text-muted py-4">No artists found for "{debouncedQuery}"</p>
              )}
              {artistResults.map((artist) => (
                <div key={artist.spotifyArtistId} className="text-center">
                  <img
                    src={artist.imageUrl || '/placeholder-cover.svg'}
                    alt={artist.name}
                    className="w-full aspect-square rounded-full object-cover bg-elevated-2 mb-2.5"
                  />
                  <p className="truncate text-[0.85rem] font-semibold">{artist.name}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
