import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import PageRouter from "./router/PageRouter";

/**
 * Main App component with routing
 * Only includes pages specified in the task requirements
 */
const App: React.FC = () => {
  return (
    <AuthProvider>
      <PageRouter />
    </AuthProvider>
  );
};

export default App;
