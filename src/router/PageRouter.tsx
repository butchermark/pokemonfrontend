import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

import ListPage from "../pages/MainPage";
import PokemonDetailPage from "../pages/PokemonDetailPage";
import MyPokemonPage from "../pages/MyPokemonPage";

const PageRouter = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // could be a spinner
  }

  return (
    <BrowserRouter>
      {isAuthenticated ? (
        <Routes>
          <Route path="/" element={<Navigate to="/pokemons" replace />} />
          <Route path="/pokemons" element={<ListPage />} />
          <Route path="/pokemons/:pokemonId" element={<PokemonDetailPage />} />
          <Route path="/my-pokemon" element={<MyPokemonPage />} />
          <Route path="/login" element={<Navigate to="/pokemons" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : (
        <Route
          path="/"
          element={
            <Navigate to={isAuthenticated ? "/listed" : "/login"} replace />
          }
        />
      )}
    </BrowserRouter>
  );
};

export default PageRouter;
