export interface Series {
  show: string;
  season: number;
  year: number;
  contestants: Pick<Contestant, "name" | "profileLink">[];
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
  series: Pick<Series, "show" | "season">;
}
