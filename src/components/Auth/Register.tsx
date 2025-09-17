import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { RegisterCredentials } from "../../types";

/**
 * Register component for user registration
 */
const Register: React.FC = () => {
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    email: "",
    username: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "confirmPassword") {
      setConfirmPassword(value);
    } else {
      setCredentials((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    if (error) setError("");
  };

  const validateForm = (): boolean => {
    if (credentials.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (credentials.password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (credentials.username.length < 3) {
      setError("Username must be at least 3 characters long");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      await register(credentials);
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    credentials.email &&
    credentials.username &&
    credentials.password &&
    confirmPassword &&
    credentials.password === confirmPassword &&
    credentials.password.length >= 6;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Become a Pokemon Trainer</h1>
          <p>Create your account to start catching Pokemon</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              placeholder="trainer@pokemon.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Trainer Name</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              placeholder="Your trainer name"
              minLength={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              placeholder="Choose a strong password"
              minLength={6}
            />
            <small className="form-hint">At least 6 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              placeholder="Confirm your password"
            />
            {confirmPassword && credentials.password !== confirmPassword && (
              <small className="form-error">Passwords do not match</small>
            )}
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
