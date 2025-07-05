export interface Season {
  season: number;
  year: number;
  contestants: SeasonContestant[];
}

export interface SeasonContestant {
  name: string;
  profileLink: string;
}

export interface Contestant {
  id: string;
  profileLink: string;
  name: string;
  looks: Look[];
  // TODO: add profile image url
}

export interface Look {
  caption: string;
  image_url: string;
  appearance: Appearance;
}

export interface Appearance {
  show: string;
  season: number;
}
