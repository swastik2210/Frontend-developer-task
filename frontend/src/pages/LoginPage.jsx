import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
  });

  // Validation
  function validate() {
    let isValid = true;
    const errors = { email: "", password: "" };

    if (!email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    }

    if (!password.trim()) {
      errors.password = "Password is required";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  }

  // Handle submit
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!validate()) {
      setError("Please fill all fields correctly");
      return;
    }

    try {
      const res = await api.post("/auth/login", { email, password });

      // Save into global context
      login(res.data.user, res.data.token);

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="page-container">
      <div className="card">

        <h1 className="title">Login</h1>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit} className="form">

          {/* Email */}
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              className={fieldErrors.email ? "input-error" : ""}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors({ ...fieldErrors, email: "" });
              }}
            />
            {fieldErrors.email && (
              <p className="error small">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              className={fieldErrors.password ? "input-error" : ""}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors({ ...fieldErrors, password: "" });
              }}
            />
            {fieldErrors.password && (
              <p className="error small">{fieldErrors.password}</p>
            )}
          </div>

          <button className="btn" type="submit">Login</button>
        </form>

        <p className="bottom-text">
          Don’t have an account?{" "}
          <Link to="/register" className="link">Register</Link>
        </p>

      </div>
    </div>
  );
}
