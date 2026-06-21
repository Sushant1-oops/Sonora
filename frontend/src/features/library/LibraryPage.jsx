import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { fetchMyPlaylists } from '../../features/playlists/playlistsSlice';
import { fetchLikedTracks, fetchFollowedArtists } from '../../features/library/librarySlice';
import TrackRow from '../../components/TrackRow';

export default function LibraryPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'playlists';
  const [tab, setTab] = useState(initialTab);

  const playlists = useSelector((state) => state.playlists.items);
  const { likedTracks, followedArtists } = useSelector((state) => state.library);

  useEffect(() => {
    dispatch(fetchMyPlaylists());
    dispatch(fetchLikedTracks());
    dispatch(fetchFollowedArtists());
  }, [dispatch]);

  const likedTrackList = likedTracks.map((l) => ({ ...l.track, _likedTrackRowId: l.id }));

  const tabBtnClass = (active) =>
    `px-[18px] py-2 rounded-full text-[0.85rem] font-semibold ${
      active ? 'bg-secondary text-white' : 'bg-elevated text-text-secondary'
    }`;

  return (
    <div className="pt-6 flex flex-col gap-5">
      <h1 className="text-3xl font-extrabold">Your Library</h1>

      <div className="flex gap-2">
        <button className={tabBtnClass(tab === 'playlists')} onClick={() => setTab('playlists')}>Playlists</button>
        <button className={tabBtnClass(tab === 'liked')} onClick={() => setTab('liked')}>Liked Songs</button>
        <button className={tabBtnClass(tab === 'artists')} onClick={() => setTab('artists')}>Following</button>
      </div>

      {tab === 'playlists' && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-[18px]">
          {playlists.length === 0 && <p className="text-text-muted py-5">You haven't created any playlists yet.</p>}
          {playlists.map((p) => (
            <div
              key={p.id}
              className="bg-elevated hover:bg-elevated-2 rounded-2xl p-3.5 cursor-pointer transition-colors"
              onClick={() => navigate(`/playlist/${p.id}`)}
            >
              <div className="w-full aspect-square rounded-md bg-gradient-to-br from-secondary to-elevated-2 flex items-center justify-center mb-3 overflow-hidden">
                {p.coverUrl ? <img src={p.coverUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-3xl text-white/60">♪</span>}
              </div>
              <p className="truncate font-semibold text-[0.9rem] mb-0.5">{p.name}</p>
              <p className="text-[0.78rem] text-text-secondary">{p._count?.tracks ?? 0} tracks</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'liked' && (
        <div className="flex flex-col gap-0.5">
          {likedTrackList.length === 0 && <p className="text-text-muted py-5">Songs you like will appear here.</p>}
          {likedTrackList.map((track, i) => (
            <TrackRow key={track.id} track={track} index={i} queueContext={likedTrackList} />
          ))}
        </div>
      )}

      {tab === 'artists' && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-[18px]">
          {followedArtists.length === 0 && <p className="text-text-muted py-5">Artists you follow will appear here.</p>}
          {followedArtists.map((a) => (
            <div key={a.id} className="bg-elevated rounded-2xl p-4 text-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center mx-auto mb-2.5 text-white">
                <Heart size={20} fill="currentColor" />
              </div>
              <p className="truncate">{a.artistName}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
