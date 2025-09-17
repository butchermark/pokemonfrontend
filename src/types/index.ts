export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
}

export interface PokemonType {
  name: string;
  url: string;
}

export interface PokemonTypeDetail {
  id: number;
  name: string;
  pokemon: Array<{
    pokemon: {
      name: string;
      url: string;
    };
  }>;
}

export interface PokemonSprites {
  front_default: string;
  front_shiny?: string;
  other?: {
    "official-artwork"?: {
      front_default: string;
    };
  };
}

export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
}

export interface PokemonTypeSlot {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: PokemonSprites;
  abilities: PokemonAbility[];
  types: PokemonTypeSlot[];
}

export interface CaughtPokemon {
  id: string;
  pokemonId: number;
  pokemonName: string;
  types: string[];
  imageUrl: string;
  weight: number;
  height: number;
  abilities: string[];
  caughtAt: string;
}

export interface CatchPokemonRequest {
  pokemonId: number;
  pokemonName: string;
  types?: string[];
  imageUrl?: string;
  weight?: number;
  height?: number;
  abilities?: string[];
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    name: string;
    url: string;
  }>;
}

export interface TypesResponse {
  count: number;
  results: PokemonType[];
}
