export interface Season {
  show: string;
  season: number;
  year: number;
  contestants: Contestant[];
}

export interface Contestant {
  name: string;
  profileLink: string;
}

export interface Queen {
  id: string;
  profileLink: string;
  name: string;
  looks: Look[];
  // TODO: add profile image url
}

export interface Look {
  caption: string;
  image_url: string;
  season: Pick<Season, "show" | "season">;
}
