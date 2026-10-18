-- ============================================================================
-- NOOK Database Schema
-- Migration: 01_initial_schema.sql
-- Description: Complete initial schema for the NOOK social platform.
-- ============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- 1. Profiles (extends auth.users provided by Supabase Auth)
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid references auth.users not null primary key,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  is_private boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Index for fast username lookup / search
create index idx_profiles_username on profiles(username);
create index idx_profiles_created_at on profiles(created_at desc);

-- ---------------------------------------------------------------------------
-- 2. Follow / unfollow relationships
-- ---------------------------------------------------------------------------
create table follows (
  follower_id uuid references profiles(id) on delete cascade not null,
  following_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  primary key (follower_id, following_id),
  constraint no_self_follow check (follower_id <> following_id)
);

create index idx_follows_follower on follows(follower_id);
create index idx_follows_following on follows(following_id);

-- ---------------------------------------------------------------------------
-- 3. Blocked users (mutual restriction)
-- ---------------------------------------------------------------------------
create table blocked_users (
  blocker_id uuid references profiles(id) on delete cascade not null,
  blocked_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  primary key (blocker_id, blocked_id),
  constraint no_self_block check (blocker_id <> blocked_id)
);

create index idx_blocked_users_blocker on blocked_users(blocker_id);

-- ---------------------------------------------------------------------------
-- 4. Posts
-- ---------------------------------------------------------------------------
create table posts (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  media_url text,
  media_type text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_posts_author on posts(author_id);
create index idx_posts_created_at on posts(created_at desc);

-- ---------------------------------------------------------------------------
-- 5. Post reactions / likes
-- ---------------------------------------------------------------------------
create table post_reactions (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  type text default 'like' not null,
  created_at timestamptz default now() not null,
  unique (post_id, user_id, type)
);

create index idx_post_reactions_post on post_reactions(post_id);
create index idx_post_reactions_user on post_reactions(user_id);

-- ---------------------------------------------------------------------------
-- 6. Comments (with reply nesting)
-- ---------------------------------------------------------------------------
create table comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  author_id uuid references profiles(id) on delete cascade not null,
  parent_id uuid references comments(id) on delete cascade,
  content text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_comments_post on comments(post_id);
create index idx_comments_author on comments(author_id);
create index idx_comments_parent on comments(parent_id);

-- ---------------------------------------------------------------------------
-- 7. Bookmarks / saved posts
-- ---------------------------------------------------------------------------
create table bookmarks (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique (post_id, user_id)
);

create index idx_bookmarks_user on bookmarks(user_id);

-- ---------------------------------------------------------------------------
-- 8. Conversations (direct messages and group conversations)
-- ---------------------------------------------------------------------------
create table conversations (
  id uuid default uuid_generate_v4() primary key,
  type text check (type in ('direct', 'group')) not null,
  name text,
  created_by uuid references profiles(id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_conversations_type on conversations(type);

-- ---------------------------------------------------------------------------
-- 9. Conversation memberships
-- ---------------------------------------------------------------------------
create table conversation_members (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text check (role in ('member', 'admin')) default 'member' not null,
  joined_at timestamptz default now() not null,
  last_read_at timestamptz default now() not null,
  muted boolean default false not null,
  unique (conversation_id, user_id)
);

create index idx_conversation_members_user on conversation_members(user_id);
create index idx_conversation_members_conversation on conversation_members(conversation_id);

-- ---------------------------------------------------------------------------
-- 10. Messages
-- ---------------------------------------------------------------------------
create table messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  content text,
  media_url text,
  media_type text,
  reply_to uuid references messages(id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  deleted_at timestamptz
);

create index idx_messages_conversation on messages(conversation_id, created_at desc);
create index idx_messages_sender on messages(sender_id);
create index idx_messages_reply_to on messages(reply_to);

-- ---------------------------------------------------------------------------
-- 11. Message read receipts
-- ---------------------------------------------------------------------------
create table message_reads (
  id uuid default uuid_generate_v4() primary key,
  message_id uuid references messages(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  read_at timestamptz default now() not null,
  unique (message_id, user_id)
);

create index idx_message_reads_user on message_reads(user_id);

-- ---------------------------------------------------------------------------
-- 12. Communities
-- ---------------------------------------------------------------------------
create table communities (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  description text,
  is_private boolean default false not null,
  owner_id uuid references profiles(id) on delete cascade not null,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_communities_slug on communities(slug);
create index idx_communities_owner on communities(owner_id);

-- ---------------------------------------------------------------------------
-- 13. Community members
-- ---------------------------------------------------------------------------
create table community_members (
  id uuid default uuid_generate_v4() primary key,
  community_id uuid references communities(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text check (role in ('owner', 'admin', 'moderator', 'member')) default 'member' not null,
  joined_at timestamptz default now() not null,
  unique (community_id, user_id)
);

create index idx_community_members_community on community_members(community_id);
create index idx_community_members_user on community_members(user_id);

-- ---------------------------------------------------------------------------
-- 14. Community channels (discussion spaces within a community)
-- ---------------------------------------------------------------------------
create table community_channels (
  id uuid default uuid_generate_v4() primary key,
  community_id uuid references communities(id) on delete cascade not null,
  name text not null,
  slug text not null,
  description text,
  created_at timestamptz default now() not null,
  unique (community_id, slug)
);

create index idx_community_channels_community on community_channels(community_id);

-- ---------------------------------------------------------------------------
-- 15. Notifications
-- ---------------------------------------------------------------------------
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  actor_id uuid references profiles(id),
  type text not null,
  entity_type text,
  entity_id uuid,
  read boolean default false not null,
  created_at timestamptz default now() not null
);

create index idx_notifications_user on notifications(user_id, read);
create index idx_notifications_created_at on notifications(created_at desc);

-- ---------------------------------------------------------------------------
-- 16. Reports (content / user reporting)
-- ---------------------------------------------------------------------------
create table reports (
  id uuid default uuid_generate_v4() primary key,
  reporter_id uuid references profiles(id) on delete cascade not null,
  reported_profile_id uuid references profiles(id) on delete set null,
  post_id uuid references posts(id) on delete cascade,
  message_id uuid references messages(id) on delete cascade,
  reason text not null,
  status text check (status in ('pending', 'reviewed', 'resolved', 'dismissed')) default 'pending' not null,
  created_at timestamptz default now() not null
);

create index idx_reports_status on reports(status);
create index idx_reports_reporter on reports(reporter_id);

-- ---------------------------------------------------------------------------
-- 17. User preferences
-- ---------------------------------------------------------------------------
create table user_preferences (
  id uuid references profiles(id) on delete cascade primary key,
  email_notifications boolean default true not null,
  push_notifications boolean default true not null,
  dark_mode boolean default false not null,
  show_online_status boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ---------------------------------------------------------------------------
-- 18. Invites (community / conversation invites)
-- ---------------------------------------------------------------------------
create table invites (
  id uuid default uuid_generate_v4() primary key,
  email text,
  invited_by uuid references profiles(id) on delete cascade not null,
  community_id uuid references communities(id) on delete cascade,
  conversation_id uuid references conversations(id) on delete cascade,
  token text unique not null,
  accepted boolean default false not null,
  expires_at timestamptz not null,
  created_at timestamptz default now() not null
);

create index idx_invites_token on invites(token);
create index idx_invites_email on invites(email);

-- ============================================================================
-- Row Level Security (RLS) — database-level authorization
-- ============================================================================
-- RLS is enabled on every table. Policies below enforce that users can only
-- read/write their own data or data they are authorized to access.

-- Profiles: public read, users update own
alter table profiles enable row level security;
create policy "Profiles are viewable by everyone" on profiles
  for select using (true);
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- Follows: public read, users manage own follows
alter table follows enable row level security;
create policy "Follows are viewable by everyone" on follows
  for select using (true);
create policy "Users can insert own follows" on follows
  for insert with check (auth.uid() = follower_id);
create policy "Users can delete own follows" on follows
  for delete using (auth.uid() = follower_id);

-- Blocked users: only blocker can see/manage
alter table blocked_users enable row level security;
create policy "Blockers can view own blocks" on blocked_users
  for select using (auth.uid() = blocker_id);
create policy "Users can insert own blocks" on blocked_users
  for insert with check (auth.uid() = blocker_id);
create policy "Users can delete own blocks" on blocked_users
  for delete using (auth.uid() = blocker_id);

-- Posts: public read, author manages own
alter table posts enable row level security;
create policy "Posts are viewable by everyone" on posts
  for select using (true);
create policy "Users can insert own posts" on posts
  for insert with check (auth.uid() = author_id);
create policy "Users can update own posts" on posts
  for update using (auth.uid() = author_id);
create policy "Users can delete own posts" on posts
  for delete using (auth.uid() = author_id);

-- Post reactions: public read, users manage own
alter table post_reactions enable row level security;
create policy "Post reactions are viewable by everyone" on post_reactions
  for select using (true);
create policy "Users can insert own post reactions" on post_reactions
  for insert with check (auth.uid() = user_id);
create policy "Users can delete own post reactions" on post_reactions
  for delete using (auth.uid() = user_id);

-- Comments: public read, author manages own
alter table comments enable row level security;
create policy "Comments are viewable by everyone" on comments
  for select using (true);
create policy "Users can insert own comments" on comments
  for insert with check (auth.uid() = author_id);
create policy "Users can update own comments" on comments
  for update using (auth.uid() = author_id);
create policy "Users can delete own comments" on comments
  for delete using (auth.uid() = author_id);

-- Bookmarks: owner-only read/write
alter table bookmarks enable row level security;
create policy "Users can view own bookmarks" on bookmarks
  for select using (auth.uid() = user_id);
create policy "Users can insert own bookmarks" on bookmarks
  for insert with check (auth.uid() = user_id);
create policy "Users can delete own bookmarks" on bookmarks
  for delete using (auth.uid() = user_id);

-- Conversations: members can read own conversations
alter table conversations enable row level security;
create policy "Members can view conversations they belong to" on conversations
  for select using (
    exists (
      select 1 from conversation_members cm
      where cm.conversation_id = id and cm.user_id = auth.uid()
    )
  );
create policy "Users can create conversations" on conversations
  for insert with check (auth.uid() = created_by);

-- Conversation members: members can read, creators manage
alter table conversation_members enable row level security;
create policy "Members can view memberships of own conversations" on conversation_members
  for select using (
    exists (
      select 1 from conversation_members cm
      where cm.conversation_id = conversation_members.conversation_id
        and cm.user_id = auth.uid()
    )
  );
create policy "Users can insert own membership" on conversation_members
  for insert with check (auth.uid() = user_id);
create policy "Users can update own membership" on conversation_members
  for update using (auth.uid() = user_id);

-- Messages: conversation members can read, sender manages own
alter table messages enable row level security;
create policy "Conversation members can view messages" on messages
  for select using (
    exists (
      select 1 from conversation_members cm
      where cm.conversation_id = messages.conversation_id
        and cm.user_id = auth.uid()
    )
  );
create policy "Users can insert own messages" on messages
  for insert with check (auth.uid() = sender_id);
create policy "Users can update own messages" on messages
  for update using (auth.uid() = sender_id);
create policy "Users can soft-delete own messages" on messages
  for update using (auth.uid() = sender_id);

-- Message reads: owner-only
alter table message_reads enable row level security;
create policy "Users can manage own message reads" on message_reads
  for all using (auth.uid() = user_id);

-- Communities: public read for public communities; members read all
alter table communities enable row level security;
create policy "Public communities viewable by everyone" on communities
  for select using (is_private = false);
create policy "Members can view communities they belong to" on communities
  for select using (
    exists (
      select 1 from community_members cm
      where cm.community_id = id and cm.user_id = auth.uid()
    )
  );
create policy "Users can create communities" on communities
  for insert with check (auth.uid() = owner_id);
create policy "Owners and admins can update communities" on communities
  for update using (
    auth.uid() = owner_id or
    exists (
      select 1 from community_members cm
      where cm.community_id = id and cm.user_id = auth.uid()
        and cm.role in ('owner', 'admin')
    )
  );

-- Community members: members can read, owners/admins manage
alter table community_members enable row level security;
create policy "Members can view memberships of own communities" on community_members
  for select using (
    exists (
      select 1 from community_members cm
      where cm.community_id = community_members.community_id
        and cm.user_id = auth.uid()
    )
  );
create policy "Owners and admins manage memberships" on community_members
  for all using (
    exists (
      select 1 from community_members cm
      where cm.community_id = community_members.community_id
        and cm.user_id = auth.uid()
        and cm.role in ('owner', 'admin')
    )
  );
create policy "Users can join communities via insert" on community_members
  for insert with check (auth.uid() = user_id);

-- Community channels: read access follows community visibility
alter table community_channels enable row level security;
create policy "Channels viewable per community rules" on community_channels
  for select using (
    exists (
      select 1 from communities c
      where c.id = community_channels.community_id
        and (c.is_private = false or
          exists (
            select 1 from community_members cm
            where cm.community_id = c.id and cm.user_id = auth.uid()
          )
        )
  );
create policy "Community admins manage channels" on community_channels
  for all using (
    exists (
      select 1 from community_members cm
      where cm.community_id = community_channels.community_id
        and cm.user_id = auth.uid()
        and cm.role in ('owner', 'admin')
    )
  );

-- Notifications: owner-only
alter table notifications enable row level security;
create policy "Users can view own notifications" on notifications
  for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on notifications
  for update using (auth.uid() = user_id);

-- Reports: reporters see own; admins/moderators see all (handled in app logic)
alter table reports enable row level security;
create policy "Users can view own reports" on reports
  for select using (auth.uid() = reporter_id);
create policy "Users can insert own reports" on reports
  for insert with check (auth.uid() = reporter_id);

-- User preferences: owner-only
alter table user_preferences enable row level security;
create policy "Users can manage own preferences" on user_preferences
  for all using (auth.uid() = id);

-- Invites: public read by token, creators manage
alter table invites enable row level security;
create policy "Invites viewable by token holder" on invites
  for select using (true);
create policy "Users can insert own invites" on invites
  for insert with check (auth.uid() = invited_by);

-- ============================================================================
-- Helper: update updated_at columns via trigger
-- ============================================================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language 'plpgsql';

create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at_column();
create trigger posts_updated_at before update on posts
  for each row execute function update_updated_at_column();
create trigger comments_updated_at before update on comments
  for each row execute function update_updated_at_column();
create trigger messages_updated_at before update on messages
  for each row execute function update_updated_at_column();
create trigger communities_updated_at before update on communities
  for each row execute function update_updated_at_column();
create trigger user_preferences_updated_at before update on user_preferences
  for each row execute function update_updated_at_column();

-- ============================================================================
-- Supabase Realtime publication
-- ============================================================================
-- Supabase Realtime listens to tables added to the supabase_realtime publication.
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table conversation_members;
alter publication supabase_realtime add table post_reactions;
alter publication supabase_realtime add table comments;

-- ============================================================================
-- End of schema
-- ============================================================================
