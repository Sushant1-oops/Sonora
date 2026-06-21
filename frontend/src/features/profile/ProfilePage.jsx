import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User as UserIcon, Pencil } from 'lucide-react';
import { userApi } from '../../services/userApi';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ displayName: '', bio: '' });
  const [loading, setLoading] = useState(true);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    setLoading(true);
    userApi
      .getPublicProfile(username)
      .then(({ data }) => {
        setProfile(data.data.user);
        setPlaylists(data.data.playlists);
        setForm({ displayName: data.data.user.displayName, bio: data.data.user.bio || '' });
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [username]);

  async function handleSave() {
    const { data } = await userApi.updateProfile(form);
    setProfile(data.data.user);
    setEditing(false);
  }

  if (loading) return null;
  if (!profile) return <p className="py-[60px] text-center text-text-muted">User not found.</p>;

  return (
    <div className="pt-6 flex flex-col gap-9">
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 text-center sm:text-left">
        <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden text-white shadow-2xl">
          {profile.avatarUrl ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" /> : <UserIcon size={48} />}
        </div>

        <div className="flex flex-col gap-1.5 min-w-0 items-center sm:items-start">
          <span className="text-[0.8rem] font-bold uppercase text-text-secondary">Profile</span>

          {editing ? (
            <div className="flex flex-col gap-3 max-w-[400px] w-full mt-1">
              <Input
                label="Display name"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              />
              <Input
                label="Bio"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell people about yourself"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl sm:text-4xl font-extrabold break-words">{profile.displayName}</h1>
              {profile.bio && <p className="text-text-secondary text-[0.9rem] max-w-[480px]">{profile.bio}</p>}
              <p className="text-[0.82rem] text-text-muted">@{profile.username}</p>
            </>
          )}

          {isOwnProfile && !editing && (
            <button
              className="inline-flex items-center gap-1.5 text-[0.82rem] text-text-secondary hover:text-text-primary mt-1.5 w-fit"
              onClick={() => setEditing(true)}
            >
              <Pencil size={14} /> Edit profile
            </button>
          )}
        </div>
      </div>

      <section>
        <h2 className="text-[1.3rem] font-bold mb-4">Public playlists</h2>
        {playlists.length === 0 && <p className="text-text-muted">No public playlists yet.</p>}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-[18px]">
          {playlists.map((p) => (
            <div
              key={p.id}
              className="bg-elevated hover:bg-elevated-2 rounded-2xl p-3.5 cursor-pointer transition-colors"
              onClick={() => navigate(`/playlist/${p.id}`)}
            >
              <div className="w-full aspect-square rounded-md bg-gradient-to-br from-secondary to-elevated-2 flex items-center justify-center text-3xl text-white/60 mb-2.5 overflow-hidden">
                {p.coverUrl ? <img src={p.coverUrl} alt="" className="w-full h-full object-cover" /> : <span>♪</span>}
              </div>
              <p className="truncate">{p.name}</p>
              <p className="text-[0.78rem] text-text-secondary">{p._count?.tracks ?? 0} tracks</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
