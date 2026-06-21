-- The original init migration was written back when this project pulled
-- tracks from Jamendo. schema.prisma was since updated for the JioSaavn +
-- YouTube integration (Track.spotifyId/youtubeId, nullable streamUrl,
-- FollowedArtist.spotifyArtistId) but a matching migration was never
-- generated, so the live database still had the old Jamendo-era columns.
-- This migration brings the database in line with the current schema.

-- AlterTable: tracks.jamendo_id -> tracks.spotify_id
ALTER TABLE "tracks" RENAME COLUMN "jamendo_id" TO "spotify_id";
ALTER INDEX "tracks_jamendo_id_key" RENAME TO "tracks_spotify_id_key";

-- AlterTable: tracks gains a nullable youtube_id (resolved on demand)
ALTER TABLE "tracks" ADD COLUMN "youtube_id" TEXT;

-- AlterTable: stream_url is no longer guaranteed up front, so it's nullable
ALTER TABLE "tracks" ALTER COLUMN "stream_url" DROP NOT NULL;

-- AlterTable: followed_artists.jamendo_artist_id -> followed_artists.spotify_artist_id
ALTER TABLE "followed_artists" RENAME COLUMN "jamendo_artist_id" TO "spotify_artist_id";
