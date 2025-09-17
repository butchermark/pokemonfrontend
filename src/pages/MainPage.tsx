import React, { useState, useEffect } from "react";
import { Pokemon, PokemonType } from "../types";
import { pokeApiService } from "../services/pokeApiService";
import { pokemonService } from "../services/pokemonService";
import { useAuth } from "../contexts/AuthContext";
import PokemonListItem from "../components/Pokemon/PokemonListItem";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";

/**
 * Main page component implementing all task requirements:
 * - Pokemon types dropdown
 * - Search bar for Pokemon names
 * - Checkbox to show only caught Pokemon
 * - Pokemon list with visual indication for caught Pokemon
 * - Navigation to Pokemon profile card
 */
const MainPage: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [pokemonTypes, setPokemonTypes] = useState<PokemonType[]>([]);
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([]);
  const [caughtPokemonIds, setCaughtPokemonIds] = useState<Set<number>>(
    new Set()
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);

  const [selectedType, setSelectedType] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showOnlyCaught, setShowOnlyCaught] = useState<boolean>(false);

  useEffect(() => {
    loadPokemonTypes();
    loadCaughtPokemonStatus();
    loadInitialPokemon();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      loadCaughtPokemonStatus();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [pokemon, searchQuery, showOnlyCaught]);

  /**
   * Load all Pokemon types for the dropdown
   */
  const loadPokemonTypes = async () => {
    try {
      setIsLoadingTypes(true);
      const typesResponse = await pokeApiService.getTypes();
      setPokemonTypes(typesResponse.results);
    } catch (error) {
      console.error("Failed to load Pokemon types:", error);
    } finally {
      setIsLoadingTypes(false);
    }
  };

  /**
   * Load caught Pokemon status from backend
   */
  const loadCaughtPokemonStatus = async () => {
    try {
      const caughtPokemon = await pokemonService.getCaughtPokemon();
      const caughtIds = new Set(caughtPokemon.map((p) => p.pokemonId));
      setCaughtPokemonIds(caughtIds);
    } catch (error) {
      console.error("Failed to load caught Pokemon status:", error);
    }
  };

  /**
   * Load initial Pokemon list
   */
  const loadInitialPokemon = async () => {
    try {
      setIsLoading(true);
      const randomPokemon = await pokeApiService.getRandomPokemonList(20);
      setPokemon(randomPokemon);
    } catch (error) {
      console.error("Failed to load Pokemon:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load Pokemon by selected type
   */
  const loadPokemonByType = async (typeName: string) => {
    try {
      setIsLoading(true);

      const typeData = pokemonTypes.find((t) => t.name === typeName);
      if (!typeData) return;

      const typeId = pokeApiService.extractPokemonId(typeData.url);
      const typeDetail = await pokeApiService.getPokemonByType(typeId);

      const pokemonPromises = typeDetail.pokemon
        .slice(0, 30)
        .map((p) => pokeApiService.getPokemonByName(p.pokemon.name));

      const detailedPokemon = await Promise.all(pokemonPromises);
      setPokemon(detailedPokemon);
    } catch (error) {
      console.error("Failed to load Pokemon by type:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle type selection from dropdown
   */
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const typeName = e.target.value;
    setSelectedType(typeName);

    if (typeName) {
      loadPokemonByType(typeName);
    } else {
      loadInitialPokemon();
    }
  };

  /**
   * Handle search input with debouncing
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      const timeoutId = setTimeout(() => {
        performSearch(query);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  };

  /**
   * Perform Pokemon search
   */
  const performSearch = async (query: string) => {
    try {
      setIsLoading(true);
      const searchResults = await pokeApiService.searchPokemon(query);
      setPokemon(searchResults);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Apply filters to Pokemon list
   */
  const applyFilters = () => {
    let filtered = [...pokemon];

    if (showOnlyCaught) {
      filtered = filtered.filter((p) => caughtPokemonIds.has(p.id));
    }

    setFilteredPokemon(filtered);
  };

  /**
   * Handle Pokemon selection for profile card
   */
  const handlePokemonSelect = async (pokemon: Pokemon) => {
    console.log("Selected Pokemon:", pokemon);
    navigate(`/pokemons/${pokemon.id}`);
  };
  /**
   * Navigate to My Pokemon page
   */
  const navigateToMyPokemon = () => {
    window.location.href = "/my-pokemon";
  };

  return (
    <div className="main-page">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">Pokemon Explorer</h1>
          <div className="user-menu">
            <span className="user-greeting">Hello, {user?.username}!</span>
            <button onClick={navigateToMyPokemon} className="nav-button">
              My Pokemon
            </button>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Filters Section */}
      <div className="filters-section">
        {/* Pokemon Type Dropdown */}
        <div className="filter-group">
          <label htmlFor="type-select">Pokemon Type:</label>
          <select
            id="type-select"
            value={selectedType}
            onChange={handleTypeChange}
            disabled={isLoadingTypes}
            className="type-dropdown"
          >
            <option value="">All Types</option>
            {pokemonTypes.map((type) => (
              <option key={type.name} value={type.name}>
                {pokeApiService.formatPokemonName(type.name)}
              </option>
            ))}
          </select>
        </div>

        {/* Search Bar */}
        <div className="filter-group">
          <label htmlFor="search-input">Search Pokemon:</label>
          <input
            id="search-input"
            type="text"
            placeholder="Search Pokemon by name..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      </div>

      {/* Pokemon List Section */}
      <div className="pokemon-section">
        {isLoading ? (
          <LoadingSpinner message="Loading Pokemon..." />
        ) : (
          <>
            <div className="pokemon-count">
              {filteredPokemon.length} Pokemon found
            </div>

            {filteredPokemon.length === 0 ? (
              <div className="no-results">
                <p>No Pokemon found. Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="pokemon-grid">
                {filteredPokemon.map((pokemon) => (
                  <PokemonListItem
                    key={pokemon.id}
                    pokemon={pokemon}
                    isCaught={caughtPokemonIds.has(pokemon.id)}
                    handlePokemonClick={handlePokemonSelect}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MainPage;
