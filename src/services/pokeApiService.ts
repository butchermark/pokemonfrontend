import axios from "axios";
import {
  Pokemon,
  PokemonListResponse,
  TypesResponse,
  PokemonTypeDetail,
} from "../types";

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

const pokeApi = axios.create({
  baseURL: POKEAPI_BASE_URL,
  timeout: 10000,
});

export const pokeApiService = {
  /**
   * Get all Pokemon types for dropdown
   */
  async getTypes(): Promise<TypesResponse> {
    const response = await pokeApi.get<TypesResponse>("/type");
    return response.data;
  },

  /**
   * Get Pokemon by type
   */
  async getPokemonByType(typeId: number): Promise<PokemonTypeDetail> {
    const response = await pokeApi.get<PokemonTypeDetail>(`/type/${typeId}`);
    return response.data;
  },

  /**
   * Get Pokemon details by ID
   */
  async getPokemonById(id: number): Promise<Pokemon> {
    const response = await pokeApi.get<Pokemon>(`/pokemon/${id}`);
    return response.data;
  },

  /**
   * Get Pokemon details by name
   */
  async getPokemonByName(name: string): Promise<Pokemon> {
    const response = await pokeApi.get<Pokemon>(
      `/pokemon/${name.toLowerCase()}`
    );
    return response.data;
  },

  /**
   * Get list of Pokemon (paginated)
   */
  async getPokemonList(
    limit: number = 20,
    offset: number = 0
  ): Promise<PokemonListResponse> {
    const response = await pokeApi.get<PokemonListResponse>(
      `/pokemon?limit=${limit}&offset=${offset}`
    );
    return response.data;
  },

  /**
   * Search Pokemon by name
   */
  async searchPokemon(query: string, limit: number = 1000): Promise<Pokemon[]> {
    try {
      const pokemonList = await this.getPokemonList(limit, 0);

      const filteredPokemon = pokemonList.results.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(query.toLowerCase())
      );

      const detailedPokemon = await Promise.all(
        filteredPokemon
          .slice(0, 20)
          .map((pokemon) => this.getPokemonByName(pokemon.name))
      );

      return detailedPokemon;
    } catch (error) {
      console.error("Search failed:", error);
      return [];
    }
  },

  /**
   * Get Pokemon ID from URL
   */
  extractPokemonId(url: string): number {
    const matches = url.match(/\/(\d+)\//);
    return matches ? parseInt(matches[1], 10) : 0;
  },

  /**
   * Get Pokemon sprite URL
   */
  getPokemonSpriteUrl(id: number): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  },

  /**
   * Get Pokemon official artwork URL
   */
  getPokemonArtworkUrl(id: number): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  },

  /**
   * Get random Pokemon for initial load
   */
  async getRandomPokemon(): Promise<Pokemon> {
    const randomId = Math.floor(Math.random() * 1010) + 1;
    return this.getPokemonById(randomId);
  },

  /**
   * Get multiple random Pokemon
   */
  /**
   * Get multiple random Pokemon (ensuring unique IDs)
   */
  async getRandomPokemonList(count: number = 20): Promise<Pokemon[]> {
    const usedIds = new Set<number>();
    const promises: Promise<Pokemon>[] = [];

    while (promises.length < count && usedIds.size < 1010) {
      const randomId = Math.floor(Math.random() * 1010) + 1;

      if (!usedIds.has(randomId)) {
        usedIds.add(randomId);
        promises.push(this.getPokemonById(randomId));
      }
    }

    const results = await Promise.allSettled(promises);

    return results
      .filter(
        (result): result is PromiseFulfilledResult<Pokemon> =>
          result.status === "fulfilled"
      )
      .map((result) => result.value);
  },

  /**
   * Format Pokemon name for display
   */
  formatPokemonName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1).replace("-", " ");
  },

  /**
   * Get type color for styling
   */
  getTypeColor(type: string): string {
    const typeColors: { [key: string]: string } = {
      normal: "#A8A878",
      fire: "#F08030",
      water: "#6890F0",
      electric: "#F8D030",
      grass: "#78C850",
      ice: "#98D8D8",
      fighting: "#C03028",
      poison: "#A040A0",
      ground: "#E0C068",
      flying: "#A890F0",
      psychic: "#F85888",
      bug: "#A8B820",
      rock: "#B8A038",
      ghost: "#705898",
      dragon: "#7038F8",
      dark: "#705848",
      steel: "#B8B8D0",
      fairy: "#EE99AC",
    };

    return typeColors[type.toLowerCase()] || "#68A090";
  },
};
