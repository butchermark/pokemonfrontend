import { authService } from "./authService";
import { CaughtPokemon, CatchPokemonRequest } from "../types";

const api = authService.getApiInstance();

export interface PokemonQueryParams {
  sortBy?: "caughtAt" | "pokemonName" | "pokemonId";
  sortOrder?: "asc" | "desc";
  type?: string;
  search?: string;
}

export const pokemonService = {
  /**
   * Catch a Pokemon
   */
  async catchPokemon(pokemonData: CatchPokemonRequest): Promise<CaughtPokemon> {
    const response = await api.post<CaughtPokemon>(
      "/pokemon/catch",
      pokemonData
    );
    return response.data;
  },

  /**
   * Release a Pokemon
   */
  async releasePokemon(pokemonId: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `/pokemon/release/${pokemonId}`
    );
    return response.data;
  },

  /**
   * Get all caught Pokemon with optional filtering and sorting
   */
  async getCaughtPokemon(
    params?: PokemonQueryParams
  ): Promise<CaughtPokemon[]> {
    const queryParams = new URLSearchParams();

    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
    if (params?.type) queryParams.append("type", params.type);
    if (params?.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString();
    const url = queryString
      ? `/pokemon/caught?${queryString}`
      : "/pokemon/caught";

    const response = await api.get<CaughtPokemon[]>(url);
    return response.data;
  },

  /**
   * Check if a specific Pokemon is caught
   */
  async isPokemonCaught(pokemonId: number): Promise<boolean> {
    const response = await api.get<{ isCaught: boolean }>(
      `/pokemon/caught/${pokemonId}/status`
    );
    return response.data.isCaught;
  },

  /**
   * Get unique types from caught Pokemon
   */
  async getCaughtPokemonTypes(): Promise<string[]> {
    const response = await api.get<string[]>("/pokemon/caught/types/unique");
    return response.data;
  },
};
