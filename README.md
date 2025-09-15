Pokemon Frontend

A ReactJS + TypeScript frontend application for the Pokemon fullstack project.
It communicates with the Pokemon Backend API and provides a user interface to explore, catch, and release Pokemon.

Features

Authentication: User registration, login, and logout

Pokemon Exploration: List all Pokemon with search and type filters

Catch & Release: Catch Pokemon and release them back to the wild

My Pokemon: View the list of caught Pokemon and manage them

Profile Cards: Detailed Pokemon profile with image, weight, height, types, and abilities

Protected Routes: Only authenticated users can access Pokemon-related pages

Global State Management: Auth state is managed using React Context API

Responsive Layout: Works on desktop and mobile

Prerequisites

Node.js (v18+ recommended)

npm

Running Pokemon Backend API (http://localhost:3001
 by default)

Installation

Clone the repository (if not already done)

git clone <your-repo-url>
cd pokemon-frontend


Install dependencies

npm install


Environment Configuration

cp .env.example .env


Update .env with your backend API URL (optional, defaults to http://localhost:3001):

REACT_APP_API_URL=http://localhost:3001


Start the application

npm start


The app will run on http://localhost:3000
.

Project Structure
src/
├── components/           # Reusable components (PokemonProfileCard, PokemonListItem, LoadingSpinner, etc.)
├── contexts/             # AuthContext for global authentication state
├── pages/                # Main pages (MainPage, MyPokemonPage, PokemonDetailPage, etc.)
├── services/             # API services (authService, pokemonService, pokeApiService)
├── types/                # TypeScript types (Pokemon, User, AuthResponse, etc.)
├── App.tsx               # Main App component with routing
└── index.tsx             # Application entry point

Routing

/login — Login page

/register — Register page

/pokemons — Main Pokemon listing (protected)

/pokemons/:pokemonId — Pokemon profile detail (protected)

/my-pokemon — User's caught Pokemon list (protected)

Available Services
authService

login(credentials) — Logs in a user and returns AuthResponse

register(credentials) — Registers a new user

logout() — Logs out the current user

setAuthToken(token) — Sets JWT token in axios headers

clearAuthToken() — Removes JWT token from axios headers

pokemonService

catchPokemon(pokemon) — Catch a Pokemon

releasePokemon(pokemonId) — Release a Pokemon

getCaughtPokemon() — Get list of user's caught Pokemon

pokeApiService

getRandomPokemonList(limit) — Fetch random Pokemon

getTypes() — Fetch all Pokemon types

getPokemonByType(typeId) — Fetch Pokemon by type

getPokemonByName(name) — Fetch Pokemon details by name

getPokemonById(id) — Fetch Pokemon details by ID

getPokemonSpriteUrl(id) — Get sprite image URL

formatPokemonName(name) — Capitalize Pokemon names

getTypeColor(type) — Returns a color string for a given type

State Management

Authentication state is provided globally via AuthContext:

const { user, accessToken, login, logout, register, isAuthenticated } = useAuth();


isAuthenticated controls access to protected routes

user contains logged-in user info

login and register perform authentication actions

logout clears user session

Development Scripts

npm start — Start frontend in development mode

npm run build — Build production-ready static files

npm run lint — Lint the code

Environment Variables
Variable	Description	Default
REACT_APP_API_URL	Backend API base URL	http://localhost:3001
Security & Auth

JWT-based authentication

Protected routes redirect unauthenticated users to /login

Axios interceptors handle automatic token injection and 401 errors

Next Steps

Ensure backend API is running and accessible

Start frontend with npm start

Register a user, login, and start catching Pokemon!
