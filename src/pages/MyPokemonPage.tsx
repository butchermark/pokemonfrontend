import React, { useState, useEffect } from "react";
import { CaughtPokemon } from "../types";
import { pokemonService } from "../services/pokemonService";
import { pokeApiService } from "../services/pokeApiService";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

/**
 * My Pokemon page for viewing and managing caught Pokemon
 * Implements filtering and sorting as required by the task
 */
const MyPokemonPage: React.FC = () => {
  const { user, logout } = useAuth();

  const [caughtPokemon, setCaughtPokemon] = useState<CaughtPokemon[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<CaughtPokemon[]>([]);
  const [caughtPokemonTypes, setCaughtPokemonTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [sortBy, setSortBy] = useState<
    "caughtAt" | "pokemonName" | "pokemonId"
  >("caughtAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    loadCaughtPokemon();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [caughtPokemon, searchQuery, selectedType, sortBy, sortOrder]);

  /**
   * Load caught Pokemon from backend
   */

  const loadCaughtPokemon = async () => {
    try {
      setIsLoading(true);
      setError("");

      let caught: CaughtPokemon[] = [];
      let types: string[] = [];

      try {
        caught = await pokemonService.getCaughtPokemon();
        console.log("Caught Pokemon loaded:", caught.length);
      } catch (err) {
        console.error("Failed to load caught Pokemon:", err);
        throw err; // Re-throw to be caught by outer try-catch
      }

      try {
        types = await pokemonService.getCaughtPokemonTypes();
        console.log("Types loaded:", types);
      } catch (err) {
        console.error(
          "Failed to load types, extracting from caught Pokemon:",
          err
        );

        const typeSet = new Set<string>();
        caught.forEach((pokemon) => {
          if (pokemon.types && Array.isArray(pokemon.types)) {
            pokemon.types.forEach((type) => typeSet.add(type));
          }
        });
        types = Array.from(typeSet).sort();
      }

      setCaughtPokemon(caught);
      setCaughtPokemonTypes(types);
    } catch (err) {
      setError("Failed to load your Pokemon. Please try again.");
      console.error("Failed to load caught Pokemon:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Apply filters and sorting to caught Pokemon
   */
  const applyFiltersAndSort = () => {
    let filtered = [...caughtPokemon];

    if (searchQuery) {
      const searchTerm = searchQuery.toLowerCase();
      filtered = filtered.filter((pokemon) =>
        pokemon.pokemonName.toLowerCase().includes(searchTerm)
      );
    }

    if (selectedType) {
      filtered = filtered.filter((pokemon) =>
        pokemon.types.includes(selectedType)
      );
    }

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "pokemonName":
          aValue = a.pokemonName.toLowerCase();
          bValue = b.pokemonName.toLowerCase();
          break;
        case "pokemonId":
          aValue = a.pokemonId;
          bValue = b.pokemonId;
          break;
        case "caughtAt":
          aValue = new Date(a.caughtAt).getTime();
          bValue = new Date(b.caughtAt).getTime();
          break;
        default:
          aValue = new Date(a.caughtAt).getTime();
          bValue = new Date(b.caughtAt).getTime();
      }

      if (sortOrder === "desc") {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

    setFilteredPokemon(filtered);
  };

  /**
   * Handle Pokemon release
   */

  /**
   * Handle Pokemon release
   */
  const handleReleasePokemon = async (pokemonId: number) => {
    const pokemon = caughtPokemon.find((p) => p.pokemonId === pokemonId);
    const pokemonName = pokemon
      ? pokeApiService.formatPokemonName(pokemon.pokemonName)
      : "this Pokemon";

    const confirmRelease = window.confirm(
      `Are you sure you want to release ${pokemonName}?`
    );

    if (!confirmRelease) return;

    try {
      console.log(`Attempting to release Pokemon ID: ${pokemonId}`);

      const response = await pokemonService.releasePokemon(pokemonId);
      console.log("Release response:", response);

      setCaughtPokemon((prevPokemon) => {
        const updated = prevPokemon.filter((p) => p.pokemonId !== pokemonId);
        console.log(`Pokemon released. Remaining count: ${updated.length}`);
        return updated;
      });

      console.log(`Successfully released ${pokemonName}`);
    } catch (error: any) {
      console.error("Failed to release Pokemon:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to release Pokemon. Please try again.";

      alert(errorMessage);
    }
  };

  {
    filteredPokemon.map((pokemon) => (
      <div key={pokemon.id} className="caught-pokemon-card">
        {/* ... other card content ... */}

        {/* Release Button - Make sure this is properly placed */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleReleasePokemon(pokemon.pokemonId);
          }}
          className="release-button"
          disabled={false}
          style={{
            cursor: "pointer",
            padding: "8px 16px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: "bold",
            marginTop: "10px",
            transition: "background-color 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#c82333";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#dc3545";
          }}
        >
          Release Pokemon
        </button>
      </div>
    ));
  }

  /*
.release-button {
  cursor: pointer;
  padding: 8px 16px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  margin-top: 10px;
  transition: background-color 0.3s, transform 0.1s;
  position: relative;
  z-index: 10;
}

.release-button:hover {
  background-color: #c82333;
  transform: translateY(-1px);
}

.release-button:active {
  transform: translateY(0);
}

.release-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.caught-pokemon-card {
  position: relative;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  transition: box-shadow 0.3s;
}

.caught-pokemon-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
*/

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Navigate back to main page
   */
  const navigateBack = () => {
    window.location.href = "/";
  };

  return (
    <div className="my-pokemon-page">
      {/* Header */}
      <header className="page-header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={navigateBack} className="back-button">
              ← Back to Explorer
            </button>
            <h1 className="page-title">My Pokemon Collection</h1>
          </div>
          <div className="header-right">
            <span className="user-greeting">Hello, {user?.username}!</span>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Filters and Sort Section */}
      <div className="filters-section">
        {/* Search */}
        <div className="filter-group">
          <label htmlFor="search">Search Pokemon:</label>
          <input
            id="search"
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Type Filter */}
        <div className="filter-group">
          <label htmlFor="type-filter">Filter by Type:</label>
          <select
            id="type-filter"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="type-dropdown"
          >
            <option value="">All Types</option>
            {caughtPokemonTypes.map((type) => (
              <option key={type} value={type}>
                {pokeApiService.formatPokemonName(type)}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="filter-group">
          <label htmlFor="sort-by">Sort by:</label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="sort-dropdown"
          >
            <option value="caughtAt">Date Caught</option>
            <option value="pokemonName">Name</option>
            <option value="pokemonId">Pokemon ID</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="filter-group">
          <label htmlFor="sort-order">Order:</label>
          <select
            id="sort-order"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
            className="sort-dropdown"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <span className="results-count">
          {isLoading
            ? "Loading..."
            : `${filteredPokemon.length} of ${caughtPokemon.length} Pokemon`}
        </span>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span className="error-text">{error}</span>
          <button onClick={loadCaughtPokemon} className="retry-button">
            Try Again
          </button>
        </div>
      )}

      {/* Pokemon Collection */}
      <div className="pokemon-collection">
        {isLoading ? (
          <LoadingSpinner message="Loading your Pokemon..." />
        ) : (
          <>
            {filteredPokemon.length === 0 ? (
              <div className="empty-collection">
                <h3>No Pokemon found</h3>
                <p>
                  {caughtPokemon.length === 0
                    ? "You haven't caught any Pokemon yet. Go explore and catch some!"
                    : "No Pokemon match your current filters. Try adjusting your search criteria."}
                </p>
                {caughtPokemon.length === 0 && (
                  <button onClick={navigateBack} className="explore-button">
                    Start Exploring
                  </button>
                )}
              </div>
            ) : (
              <div className="pokemon-grid">
                {filteredPokemon.map((pokemon) => (
                  <div key={pokemon.id} className="caught-pokemon-card">
                    {/* Pokemon Image */}
                    <div className="pokemon-image-container">
                      <img
                        src={
                          pokemon.imageUrl ||
                          pokeApiService.getPokemonSpriteUrl(pokemon.pokemonId)
                        }
                        alt={pokemon.pokemonName}
                        className="pokemon-image"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src =
                            pokeApiService.getPokemonSpriteUrl(
                              pokemon.pokemonId
                            );
                        }}
                      />
                    </div>

                    {/* Pokemon Info */}
                    <div className="pokemon-info">
                      <div className="pokemon-header">
                        <h3 className="pokemon-name">
                          {pokeApiService.formatPokemonName(
                            pokemon.pokemonName
                          )}
                        </h3>
                        <span className="pokemon-id">
                          #{pokemon.pokemonId.toString().padStart(3, "0")}
                        </span>
                      </div>

                      {/* Types */}
                      <div className="pokemon-types">
                        {pokemon.types &&
                          pokemon.types.map((type) => (
                            <span
                              key={type}
                              className="pokemon-type"
                              style={{
                                backgroundColor:
                                  pokeApiService.getTypeColor(type),
                                color: "white",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontSize: "12px",
                                marginRight: "4px",
                                display: "inline-block",
                              }}
                            >
                              {type}
                            </span>
                          ))}
                      </div>

                      {/* Stats */}
                      <div className="pokemon-stats">
                        {pokemon.height && (
                          <div className="stat-item">
                            <span className="stat-label">Height:</span>
                            <span className="stat-value">
                              {(pokemon.height / 10).toFixed(1)} m
                            </span>
                          </div>
                        )}
                        {pokemon.weight && (
                          <div className="stat-item">
                            <span className="stat-label">Weight:</span>
                            <span className="stat-value">
                              {(pokemon.weight / 10).toFixed(1)} kg
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Abilities */}
                      {pokemon.abilities && pokemon.abilities.length > 0 && (
                        <div className="pokemon-abilities">
                          <span className="abilities-label">Abilities:</span>
                          <div className="abilities-list">
                            {pokemon.abilities
                              .slice(0, 2)
                              .map((ability, index) => (
                                <span key={ability} className="ability">
                                  {pokeApiService.formatPokemonName(ability)}
                                  {index <
                                    Math.min(pokemon.abilities.length, 2) - 1 &&
                                    ", "}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Caught Date */}
                      <div className="caught-date">
                        <span className="date-label">Caught:</span>
                        <span className="date-value">
                          {formatDate(pokemon.caughtAt)}
                        </span>
                      </div>

                      {/* Release Button - Fixed version */}
                      <button
                        type="button"
                        onClick={() => {
                          console.log(
                            `Releasing Pokemon: ${pokemon.pokemonName} (ID: ${pokemon.pokemonId})`
                          );
                          handleReleasePokemon(pokemon.pokemonId);
                        }}
                        className="release-button"
                        style={{
                          cursor: "pointer",
                          padding: "10px 20px",
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "14px",
                          fontWeight: "bold",
                          marginTop: "12px",
                          width: "100%",
                          transition: "all 0.3s ease",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = "#c82333";
                          e.currentTarget.style.boxShadow =
                            "0 4px 8px rgba(0,0,0,0.2)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = "#dc3545";
                          e.currentTarget.style.boxShadow =
                            "0 2px 4px rgba(0,0,0,0.1)";
                        }}
                      >
                        🔓 Release Pokemon
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyPokemonPage;
