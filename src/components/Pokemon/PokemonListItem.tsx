import React from "react";
import { Pokemon } from "../../types";
import { pokeApiService } from "../../services/pokeApiService";
import { Box } from "@mui/material";

interface PokemonListItemProps {
  pokemon: Pokemon;
  isCaught: boolean;
  handlePokemonClick: (pokemon: Pokemon) => Promise<void>;
}

/**
 * Pokemon list item component with visual indication for caught Pokemon
 */
const PokemonListItem: React.FC<PokemonListItemProps> = ({
  pokemon,
  isCaught,
  handlePokemonClick,
}) => {
  const handleClick = async () => {
    handlePokemonClick(pokemon);
  };

  const getImageUrl = () => {
    return (
      pokemon.sprites.other?.["official-artwork"]?.front_default ||
      pokemon.sprites.front_default ||
      pokeApiService.getPokemonSpriteUrl(pokemon.id)
    );
  };

  return (
    <Box
      className={`pokemon-list-item ${isCaught ? "caught" : ""}`}
      onClick={handleClick}
    >
      {/* Pokemon Image */}
      <div className="pokemon-image">
        <img src={getImageUrl()} alt={pokemon.name} loading="lazy" />
        {isCaught && <div className="caught-indicator">Caught</div>}
      </div>

      {/* Pokemon Info */}
      <div className="pokemon-info">
        <h3 className="pokemon-name">
          {pokeApiService.formatPokemonName(pokemon.name)}
        </h3>
        <p className="pokemon-id">#{pokemon.id}</p>

        {/* Pokemon Types */}
        <div className="pokemon-types">
          {pokemon.types.map((typeSlot) => (
            <span
              key={typeSlot.type.name}
              className="pokemon-type"
              style={{
                backgroundColor: pokeApiService.getTypeColor(
                  typeSlot.type.name
                ),
              }}
            >
              {typeSlot.type.name}
            </span>
          ))}
        </div>
      </div>
    </Box>
  );
};

export default PokemonListItem;
