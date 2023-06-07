//TODO: fix later

interface UserCompact {
  id: number;
  avatarUrl: string;
  country_code: string;
  is_active: boolean;
  is_bot: boolean;
  is_deleted: boolean;
  is_online: boolean;
  is_supporter: boolean;
  last_visit: any;
  pm_friends_only?: string;
  username: string;
  global_rank?: number;
}

export interface UserOsu extends UserCompact {
  cover_url: string;
  discord?: string;
  has_supported: boolean;
  interests: string;
  join_date: any;
  location?: string;
  max_blocks: number;
  max_friends: number;
  occupation?: string;
  playmode: any;
  playstyle: string[];
  post_count: number;
  profile_order: any;
  title?: string;
  title_url?: string;
  twitter?: string;
  website?: string;
  [key: string]: any;
}
