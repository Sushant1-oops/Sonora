import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search as SearchIcon, ArrowLeft } from 'lucide-react';
import { setQuery, searchTracks, searchArtists, clearResults } from '../../features/search/searchSlice';
import { useDebounce } from '../../hooks/useDebounce';
import TrackRow from '../../components/TrackRow';
import { musicApi } from '../../services/musicApi';
import toast from 'react-hot-toast';

export default function SearchPage() {
  const dispatch = useDispatch();
  const { query, trackResults, artistResults, status } = useSelector((state) => state.search);
  const [tab, setTab] = useState('tracks');
  const debouncedQuery = useDebounce(query, 400);

  const [selectedArtist, setSelectedArtist] = useState(null);
  const [artistTracks, setArtistTracks] = useState([]);
  const [loadingArtistTracks, setLoadingArtistTracks] = useState(false);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      dispatch(clearResults());
      return;
    }
    dispatch(searchTracks({ query: debouncedQuery }));
    dispatch(searchArtists(debouncedQuery));
    setSelectedArtist(null);
    setArtistTracks([]);
  }, [debouncedQuery, dispatch]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setSelectedArtist(null);
    setArtistTracks([]);
  };

  const handleArtistClick = async (artist) => {
    setSelectedArtist(artist);
    setLoadingArtistTracks(true);
    try {
      const { data } = await musicApi.getArtistTracks(artist.spotifyArtistId);
      setArtistTracks(data.data || []);
    } catch (err) {
      toast.error('Failed to load artist tracks');
    } finally {
      setLoadingArtistTracks(false);
    }
  };

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
              onClick={() => handleTabChange('tracks')}
            >
              Songs
            </button>
            <button
              className={`px-[18px] py-2 rounded-full text-[0.85rem] font-semibold ${
                tab === 'artists' ? 'bg-text-primary text-bg' : 'bg-elevated text-text-secondary'
              }`}
              onClick={() => handleTabChange('artists')}
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
            <>
              {selectedArtist ? (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <button
                      className="p-2 rounded-full bg-elevated hover:bg-elevated-2 text-text-primary transition-colors"
                      onClick={() => setSelectedArtist(null)}
                      aria-label="Back to artists"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-4">
                      <img
                        src={selectedArtist.imageUrl || '/placeholder-cover.svg'}
                        alt={selectedArtist.name}
                        className="w-16 h-16 rounded-full object-cover bg-elevated-2 shadow-lg"
                      />
                      <div>
                        <h2 className="text-2xl font-bold">{selectedArtist.name}</h2>
                        <p className="text-[0.85rem] text-text-secondary">Artist Songs</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    {loadingArtistTracks ? (
                      <p className="text-text-muted py-4">Loading songs…</p>
                    ) : artistTracks.length === 0 ? (
                      <p className="text-text-muted py-4">No songs found for this artist.</p>
                    ) : (
                      artistTracks.map((track, i) => (
                        <TrackRow
                          key={track.spotifyId}
                          track={track}
                          index={i}
                          queueContext={artistTracks}
                        />
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-5">
                  {artistResults.length === 0 && (
                    <p className="text-text-muted py-4">No artists found for "{debouncedQuery}"</p>
                  )}
                  {artistResults.map((artist) => (
                    <div
                      key={artist.spotifyArtistId}
                      className="text-center group cursor-pointer bg-elevated hover:bg-elevated-2 p-4 rounded-xl transition-all duration-200"
                      onClick={() => handleArtistClick(artist)}
                    >
                      <img
                        src={artist.imageUrl || '/placeholder-cover.svg'}
                        alt={artist.name}
                        className="w-full aspect-square rounded-full object-cover bg-elevated-2 mb-2.5 shadow-md group-hover:scale-105 transition-transform duration-200"
                      />
                      <p className="truncate text-[0.85rem] font-semibold">{artist.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
