import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Chip,
  Card,
  CardMedia,
  IconButton,
} from "@mui/material";
import { Pokemon } from "../types";
import { pokeApiService } from "../services/pokeApiService";
import { pokemonService } from "../services/pokemonService";
import LoadingSpinner from "../components/LoadingSpinner";

/**
 * Pokemon detail page that shows detailed information and handles catch/release
 * Merged PokemonDetailPage and PokemonProfileCard functionality
 */
const PokemonDetailPage: React.FC = () => {
  const navigate = useNavigate();

  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCaught, setIsCaught] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const { pokemonId } = useParams<{ pokemonId: string }>();

  useEffect(() => {
    if (!pokemonId) return;

    const fetchPokemon = async () => {
      try {
        setIsLoading(true);
        const data = await pokeApiService.getPokemonById(Number(pokemonId));
        setPokemon(data);

        const caughtStatus = await pokemonService.isPokemonCaught(data.id);
        setIsCaught(caughtStatus);
      } catch (err) {
        console.error("Failed to fetch Pokemon:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPokemon();
  }, [pokemonId]); // Change dependency array too

  const handleCatch = async () => {
    if (!pokemon) return;

    setIsActionLoading(true);
    try {
      const catchData = {
        pokemonId: pokemon.id,
        pokemonName: pokemon.name,
        types: pokemon.types?.map((t) => t.type.name) || [],
        imageUrl:
          pokemon.sprites?.other?.["official-artwork"]?.front_default ||
          pokemon.sprites?.front_default ||
          pokeApiService.getPokemonSpriteUrl(pokemon.id),
        weight: pokemon.weight || 0,
        height: pokemon.height || 0,
        abilities:
          pokemon.abilities
            ?.filter((a) => !a.is_hidden)
            .map((a) => a.ability.name) || [],
      };

      await pokemonService.catchPokemon(catchData);
      setIsCaught(true);
      console.log("Pokemon caught successfully!");
    } catch (error) {
      console.error("Failed to catch Pokemon:", error);
      alert("Failed to catch Pokemon. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRelease = async () => {
    if (!pokemon) return;

    setIsActionLoading(true);
    try {
      await pokemonService.releasePokemon(pokemon.id);
      setIsCaught(false);
      console.log("Pokemon released successfully!");
    } catch (error) {
      console.error("Failed to release Pokemon:", error);
      alert("Failed to release Pokemon. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCatchRelease = async () => {
    if (isCaught) {
      await handleRelease();
    } else {
      await handleCatch();
    }
  };

  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  const getImageUrl = () => {
    if (!pokemon?.sprites)
      return pokeApiService.getPokemonSpriteUrl(pokemon?.id || 0);

    return (
      pokemon.sprites.other?.["official-artwork"]?.front_default ||
      pokemon.sprites.front_default ||
      pokeApiService.getPokemonSpriteUrl(pokemon.id)
    );
  };

  const formatWeight = (weight: number) => {
    return (weight / 10).toFixed(1) + " kg";
  };

  const formatHeight = (height: number) => {
    return (height / 10).toFixed(1) + " m";
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
      >
        <LoadingSpinner message="Loading Pokemon..." />
      </Box>
    );
  }

  if (!pokemon) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        flexDirection="column"
        sx={{ backgroundColor: "rgba(0, 0, 0, 0.8)", color: "white" }}
      >
        <Typography variant="h4" gutterBottom>
          Pokemon not found
        </Typography>
        <Button variant="contained" onClick={handleClose}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 600,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          borderRadius: 4,
          position: "relative",
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 1,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.9)",
            },
          }}
        >
          <Box> Close</Box>
        </IconButton>

        {/* Pokemon Image */}
        <Card
          sx={{
            background: "linear-gradient(135deg, #667eea20, #764ba220)",
            borderRadius: 2,
            margin: 3,
            padding: 2,
            textAlign: "center",
          }}
          elevation={0}
        >
          <CardMedia
            component="img"
            image={getImageUrl()}
            alt={pokemon.name}
            sx={{
              width: 200,
              height: 200,
              objectFit: "contain",
              margin: "0 auto",
            }}
          />
          {isActionLoading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 2,
              }}
            >
              <LoadingSpinner size="small" message="" />
            </Box>
          )}
        </Card>

        <Box sx={{ padding: 3 }}>
          {/* Pokemon Header */}
          <Box sx={{ textAlign: "center", marginBottom: 3 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: "bold", marginBottom: 1 }}
            >
              {pokeApiService.formatPokemonName(pokemon.name)}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              #{pokemon.id.toString().padStart(3, "0")}
            </Typography>
          </Box>

          {/* Pokemon Types */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 1,
              marginBottom: 3,
              flexWrap: "wrap",
            }}
          >
            {pokemon.types?.map((typeSlot) => (
              <Chip
                key={typeSlot.type.name}
                label={typeSlot.type.name.toUpperCase()}
                sx={{
                  backgroundColor: pokeApiService.getTypeColor(
                    typeSlot.type.name
                  ),
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                }}
              />
            ))}
          </Box>

          {/* Measurements */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 4,
              marginBottom: 3,
            }}
          >
            <Card
              sx={{
                backgroundColor: "grey.50",
                padding: 2,
                textAlign: "center",
                minWidth: 100,
                border: "1px solid",
                borderColor: "grey.200",
              }}
              elevation={0}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", color: "primary.main" }}
              >
                {formatHeight(pokemon.height || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Height
              </Typography>
            </Card>
            <Card
              sx={{
                backgroundColor: "grey.50",
                padding: 2,
                textAlign: "center",
                minWidth: 100,
                border: "1px solid",
                borderColor: "grey.200",
              }}
              elevation={0}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", color: "primary.main" }}
              >
                {formatWeight(pokemon.weight || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Weight
              </Typography>
            </Card>
          </Box>

          {/* Abilities */}
          <Box sx={{ marginBottom: 3 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", marginBottom: 2, textAlign: "center" }}
            >
              Abilities
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              {pokemon.abilities
                ?.filter((ability) => !ability.is_hidden)
                .map((ability) => (
                  <Chip
                    key={ability.ability.name}
                    label={pokeApiService.formatPokemonName(
                      ability.ability.name
                    )}
                    sx={{
                      backgroundColor: "primary.light",
                      color: "primary.contrastText",
                      fontWeight: 500,
                    }}
                  />
                )) || []}
            </Box>
          </Box>

          {/* Catch/Release Button */}
          <Box sx={{ textAlign: "center" }}>
            <Button
              onClick={handleCatchRelease}
              disabled={isActionLoading}
              variant="contained"
              color={isCaught ? "error" : "success"}
              size="large"
              sx={{
                borderRadius: 3,
                padding: "12px 32px",
                fontWeight: "bold",
                fontSize: "1rem",
                textTransform: "none",
                minHeight: 48,
                width: "100%",
                maxWidth: 300,
              }}
            >
              {isActionLoading ? (
                <>
                  <Box sx={{ marginRight: 1 }}>
                    <LoadingSpinner size="small" message="" />
                  </Box>
                  {isCaught ? "Releasing..." : "Catching..."}
                </>
              ) : (
                <>{isCaught ? "Release Pokemon" : "Catch Pokemon"}</>
              )}
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default PokemonDetailPage;
