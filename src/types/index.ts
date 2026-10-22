export interface Member {
  id: string;
  name: string;
  role: string;
  roleFull: string;
  emoji: string;
  photoUrl?: string;
  color: string;
  colorGlow: string;
  bio: string;
  quote: string;
  focus: string;
  projects: string;
  responsibilities: string[];
}

export interface Achievement {
  id: string;
  title: string;
  category: string;
  year: string;
  description: string;
  photoUrl?: string;
  icon?: string;
}

export interface SiteContent {
  heroTag: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroDesc: string;
  stats: { val: string; lbl: string }[];
  schoolTitle: string;
  schoolDesc: string;
  missionTitle: string;
  missionDesc: string;
  values: { icon: string; title: string; desc: string }[];
  standTitle: string;
  standDesc: string;
  standPhotoUrl: string;
  standPoints: string[];
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}
