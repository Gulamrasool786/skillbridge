import { useState } from "react";
import { Link, Navigate } from "react-router";
import { useAuth } from "../context/AuthContext.js";
import { registerUser } from "../services/authService.js";

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

export default function Register() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "client",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = {};

    if (form.name.trim().length < 2) {
      nextErrors.name = "Enter at least 2 characters.";
    }

    if (form.password.length < 15) {
      nextErrors.password = "Use at least 15 characters.";
    } else if (new TextEncoder().encode(form.password).length > 72) {
      nextErrors.password =
        "This password is too long. Use a shorter passphrase.";
    }

    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);

    try {
      await registerUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      });

      setForm((previous) => ({
        ...previous,
        password: "",
        confirmPassword: "",
      }));
      setCreated(true);
    } catch (error) {
      setErrors(error.fieldErrors || {});
      setSubmitError(error.message || "Could not create your account.");
    } finally {
      setSubmitting(false);
    }
  }

  if (user){
    return(
      <Navigate
      to={user.role === "freelance" ? "/my-profile" : "/projects"}
      />
    );
  }

  if (created) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8">
          <h1 className="text-2xl font-semibold">Your account is ready!</h1>

          <p role="status" className="mt-3 leading-7 text-slate-600">
            Sign in with your email and password to enter your workspace.
          </p>

          <Link
            to="/login"
            className="mt-6 block rounded-xl bg-violet-600 px-5 py-3 text-center font-semibold text-white hover:bg-violet-700"
          >
            Continue to login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Link to="/" className="text-2xl font-bold tracking-tight">
          skillbridge<span className="text-violet-600">.</span>
        </Link>

        <h1 className="mt-8 text-3xl font-semibold tracking-tight">
          Create your account
        </h1>

        <p className="mt-3 leading-7 text-slate-500">
          Bring your next idea or opportunity to life.
        </p>

        <form onSubmit={handleSubmit} className="mt-8">
          <fieldset disabled={submitting} className="space-y-5">
            <div>
              <label htmlFor="register-name" className="text-sm font-medium">
                Full name
              </label>
              <input
                id="register-name"
                name="name"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                required
                minLength={2}
                maxLength={80}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
                className={inputClass}
              />
              {errors.name && (
                <p id="name-error" className="mt-2 text-sm text-red-700">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="register-email" className="text-sm font-medium">
                Email address
              </label>
              <input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                required
                maxLength={254}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={inputClass}
              />
              {errors.email && (
                <p id="email-error" className="mt-2 text-sm text-red-700">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="register-role" className="text-sm font-medium">
                How will you use SkillBridge?
              </label>
              <select
                id="register-role"
                name="role"
                value={form.role}
                onChange={handleChange}
                aria-invalid={Boolean(errors.role)}
                aria-describedby={errors.role ? "role-error" : undefined}
                className={inputClass}
              >
                <option value="client">I want to hire talent</option>
                <option value="freelancer">I want to offer my skills</option>
              </select>
              {errors.role && (
                <p id="role-error" className="mt-2 text-sm text-red-700">
                  {errors.role}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="register-password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={15}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password
                    ? "password-hint password-error"
                    : "password-hint"
                }
                className={inputClass}
              />
              <p id="password-hint" className="mt-2 text-sm text-slate-500">
                Use at least 15 characters. A phrase is easier to remember.
              </p>
              {errors.password && (
                <p id="password-error" className="mt-2 text-sm text-red-700">
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirm-password" className="text-sm font-medium">
                Confirm password
              </label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={
                  errors.confirmPassword ? "confirm-error" : undefined
                }
                className={inputClass}
              />
              {errors.confirmPassword && (
                <p id="confirm-error" className="mt-2 text-sm text-red-700">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {submitError && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
              >
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-wait disabled:opacity-60"
            >
              {submitting ? "Creating your account..." : "Create account"}
            </button>
          </fieldset>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-voilet-700">
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}