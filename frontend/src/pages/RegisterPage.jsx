import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    password: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
    setError("");
  }

  function validate() {
    let valid = true;
    const errors = { name: "", email: "", password: "" };

    if (!form.name.trim()) {
      errors.name = "Name is required";
      valid = false;
    }

    if (!form.email.trim()) {
      errors.email = "Email is required";
      valid = false;
    }

    if (!form.password.trim()) {
      errors.password = "Password is required";
      valid = false;
    }

    setFieldErrors(errors);
    return valid;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) {
      setError("Please fill all fields correctly");
      return;
    }

    try {
      const res = await api.post("/auth/register", form);

      // Set global user & token
      login(res.data.user, res.data.token);

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  }

  return (
    <div className="page-container">
      <div className="card">

        <h1 className="title">Register</h1>
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit} className="form">

          {/* Name */}
          <div className="field">
            <label>Name</label>
            <input
              name="name"
              placeholder="Your name"
              value={form.name}
              className={fieldErrors.name ? "input-error" : ""}
              onChange={handleChange}
            />
            {fieldErrors.name && (
              <p className="error small">{fieldErrors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              className={fieldErrors.email ? "input-error" : ""}
              onChange={handleChange}
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
              name="password"
              placeholder="••••••••"
              value={form.password}
              className={fieldErrors.password ? "input-error" : ""}
              onChange={handleChange}
            />
            {fieldErrors.password && (
              <p className="error small">{fieldErrors.password}</p>
            )}
          </div>

          <button className="btn-green" type="submit">Create Account</button>
        </form>

        <p className="bottom-text">
          Already have an account?{" "}
          <Link to="/login" className="link">Login</Link>
        </p>

      </div>
    </div>
  );
}
