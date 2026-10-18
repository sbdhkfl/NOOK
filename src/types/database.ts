export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          is_private: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          is_private?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          is_private?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      follows: {
        Row: {
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      blocked_users: {
        Row: {
          blocker_id: string
          blocked_id: string
          created_at: string
        }
        Insert: {
          blocker_id: string
          blocked_id: string
          created_at?: string
        }
        Update: {
          blocker_id?: string
          blocked_id?: string
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          author_id: string
          content: string
          media_url: string | null
          media_type: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          content: string
          media_url?: string | null
          media_type?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          content?: string
          media_url?: string | null
          media_type?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      post_reactions: {
        Row: {
          id: string
          post_id: string
          user_id: string
          type: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          type?: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          type?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          author_id: string
          parent_id: string | null
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          author_id: string
          parent_id?: string | null
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          author_id?: string
          parent_id?: string | null
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      bookmarks: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          type: string
          name: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: string
          name?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: string
          name?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conversation_members: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          role: string
          joined_at: string
          last_read_at: string
          muted: boolean
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          role?: string
          joined_at?: string
          last_read_at?: string
          muted?: boolean
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          role?: string
          joined_at?: string
          last_read_at?: string
          muted?: boolean
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string | null
          media_url: string | null
          media_type: string | null
          reply_to: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content?: string | null
          media_url?: string | null
          media_type?: string | null
          reply_to?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string | null
          media_url?: string | null
          media_type?: string | null
          reply_to?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      message_reads: {
        Row: {
          id: string
          message_id: string
          user_id: string
          read_at: string
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          read_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          read_at?: string
        }
      }
      communities: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          is_private: boolean
          owner_id: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          is_private?: boolean
          owner_id: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          is_private?: boolean
          owner_id?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      community_members: {
        Row: {
          id: string
          community_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          community_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          id?: string
          community_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
      }
      community_channels: {
        Row: {
          id: string
          community_id: string
          name: string
          slug: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          community_id: string
          name: string
          slug: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          community_id?: string
          name?: string
          slug?: string
          description?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          actor_id: string | null
          type: string
          entity_type: string | null
          entity_id: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          actor_id?: string | null
          type: string
          entity_type?: string | null
          entity_id?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          actor_id?: string | null
          type?: string
          entity_type?: string | null
          entity_id?: string | null
          read?: boolean
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          reported_profile_id: string | null
          post_id: string | null
          message_id: string | null
          reason: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_profile_id?: string | null
          post_id?: string | null
          message_id?: string | null
          reason: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          reported_profile_id?: string | null
          post_id?: string | null
          message_id?: string | null
          reason?: string
          status?: string
          created_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          email_notifications: boolean
          push_notifications: boolean
          dark_mode: boolean
          show_online_status: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email_notifications?: boolean
          push_notifications?: boolean
          dark_mode?: boolean
          show_online_status?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email_notifications?: boolean
          push_notifications?: boolean
          dark_mode?: boolean
          show_online_status?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      invites: {
        Row: {
          id: string
          email: string | null
          invited_by: string
          community_id: string | null
          conversation_id: string | null
          token: string
          accepted: boolean
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          email?: string | null
          invited_by: string
          community_id?: string | null
          conversation_id?: string | null
          token: string
          accepted?: boolean
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          invited_by?: string
          community_id?: string | null
          conversation_id?: string | null
          token?: string
          accepted?: boolean
          expires_at?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
