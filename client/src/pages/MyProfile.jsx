import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.js";
import {
  getMyProfile,
  saveMyProfile,
  updateMyProfileStatus,
} from "../services/freelancerProfileService.js";

const categories = [
  "Development",
  "Design",
  "Writing",
  "Marketing",
];

const emptyForm = {
  title: "",
  description: "",
  category: "Development",
  skills: "",
  startingPrice: "",
  deliveryDays: "",
};

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

function toForm(profile) {
  return {
    title: profile.title,
    description: profile.description,
    category: profile.category,
    skills: profile.skills.join(", "),
    startingPrice: String(profile.startingPrice),
    deliveryDays: String(profile.deliveryDays),
  };
}

function FieldError({ name, errors }) {
  if (!errors[name]) return null;

  return (
    <p
      id={`${name}-error`}
      className="mt-2 text-sm text-red-700"
    >
      {errors[name]}
    </p>
  );
}

export default function MyProfile() {
  const { clearSession } = useAuth();

  const [form, setForm] = useState({ ...emptyForm });
  const [status, setStatus] = useState("Draft");
  const [hasProfile, setHasProfile] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [saving, setSaving] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState("");

  const busy = saving || changingStatus;

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfile() {
      setLoading(true);
      setLoadError("");

      try {
        const profile = await getMyProfile(controller.signal);

        if (controller.signal.aborted) return;

        setForm(profile ? toForm(profile) : { ...emptyForm });
        setStatus(profile?.status || "Draft");
        setHasProfile(Boolean(profile));
        setHasUnsavedChanges(false);
      } catch (error) {
        if (controller.signal.aborted) return;

        if (error.status === 401) {
          clearSession();
        } else {
          setLoadError(
            error.message || "Could not load your profile."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => controller.abort();
  }, [reloadKey, clearSession]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setHasUnsavedChanges(true);
    setSuccess("");
    setSubmitError("");

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  }

  function fieldAccessibility(name) {
    return {
      "aria-invalid": Boolean(errors[name]),
      "aria-describedby": errors[name]
        ? `${name}-error`
        : undefined,
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (busy) return;

    setErrors({});
    setSubmitError("");
    setSuccess("");

    const skills = form.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    const details = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      skills,
      startingPrice: Number(form.startingPrice),
      deliveryDays: Number(form.deliveryDays),
    };

    const nextErrors = {};

    if (details.title.length < 5 || details.title.length > 100) {
      nextErrors.title =
        "Enter a headline between 5 and 100 characters.";
    }

    if (
      details.description.length < 30 ||
      details.description.length > 2000
    ) {
      nextErrors.description =
        "Enter a bio between 30 and 2000 characters.";
    }

    if (!categories.includes(details.category)) {
      nextErrors.category = "Choose a valid category.";
    }

    if (
      skills.length < 1 ||
      skills.length > 10 ||
      skills.some((skill) => skill.length > 40)
    ) {
      nextErrors.skills =
        "Add 1–10 skills, each no longer than 40 characters.";
    }

    if (
      !Number.isInteger(details.startingPrice) ||
      details.startingPrice < 1 ||
      details.startingPrice > 1000000
    ) {
      nextErrors.startingPrice =
        "Enter a whole-dollar price from 1 to 1,000,000.";
    }

    if (
      !Number.isInteger(details.deliveryDays) ||
      details.deliveryDays < 1 ||
      details.deliveryDays > 365
    ) {
      nextErrors.deliveryDays =
        "Enter a whole number from 1 to 365.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSubmitError("Please correct the highlighted fields.");
      return;
    }

    setSaving(true);

    try {
      const profile = await saveMyProfile(details);

      setForm(toForm(profile));
      setStatus(profile.status);
      setHasProfile(true);
      setHasUnsavedChanges(false);

      setSuccess(
        profile.status === "Published"
          ? "Your changes have been saved to your published profile."
          : "Your profile has been saved. You can now publish it."
      );
    } catch (error) {
      if (error.status === 401) {
        clearSession();
      } else {
        setErrors(error.fieldErrors || {});
        setSubmitError(
          error.message || "Could not save your profile."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange() {
    if (busy) return;

    const nextStatus =
      status === "Published" ? "Draft" : "Published";

    if (
      nextStatus === "Published" &&
      (!hasProfile || hasUnsavedChanges)
    ) {
      setSubmitError("Save your changes before publishing.");
      return;
    }

    setChangingStatus(true);
    setErrors({});
    setSubmitError("");
    setSuccess("");

    try {
      const profile = await updateMyProfileStatus(nextStatus);

      setStatus(profile.status);

      setSuccess(
        profile.status === "Published"
          ? "Your profile is published! Find it in Discover Talent."
          : "Your profile is now a private draft."
      );
    } catch (error) {
      if (error.status === 401) {
        clearSession();
      } else {
        setErrors(error.fieldErrors || {});
        setSubmitError(
          error.message || "Could not update publication status."
        );
      }
    } finally {
      setChangingStatus(false);
    }
  }

  if (loading) {
    return (
      <p role="status" className="text-slate-500">
        Loading your profile...
      </p>
    );
  }

  if (loadError) {
    return (
      <section className="rounded-2xl border border-red-200 bg-white p-8">
        <h1 className="text-2xl font-semibold">
          Could not load your profile
        </h1>

        <p role="alert" className="mt-3 text-red-700">
          {loadError}
        </p>

        <button
          type="button"
          onClick={() => setReloadKey((previous) => previous + 1)}
          className="mt-5 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-700"
        >
          Try again
        </button>
      </section>
    );
  }

  return (
    <section className="max-w-3xl">
      <p className="text-xs font-semibold tracking-widest text-violet-600">
        YOUR FREELANCER WORKSPACE
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          My professional profile
        </h1>

        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            status === "Published"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-violet-100 text-violet-700"
          }`}
        >
          {hasProfile ? status : "Not saved"}
        </span>
      </div>

      <p className="mt-4 leading-7 text-slate-500">
        Tell clients what you do and how you can help.
        Save your changes before publishing.
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {status === "Published"
          ? "Your saved profile is public. Saving edits updates the public version."
          : "Your draft stays private until you publish it."}
      </p>

      <form
        onSubmit={handleSubmit}
        aria-busy={busy}
        className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
      >
        <fieldset disabled={busy} className="space-y-6">
          <div>
            <label htmlFor="title" className="text-sm font-semibold">
              Professional headline
            </label>

            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Full-stack developer for business websites"
              required
              minLength={5}
              maxLength={100}
              className={inputClass}
              {...fieldAccessibility("title")}
            />

            <FieldError name="title" errors={errors} />
          </div>

          <div>
            <label
              htmlFor="description"
              className="text-sm font-semibold"
            >
              About your services
            </label>

            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your experience, services, and what clients can expect."
              required
              minLength={30}
              maxLength={2000}
              rows={6}
              className={`${inputClass} resize-y`}
              {...fieldAccessibility("description")}
            />

            <p className="mt-2 text-xs text-slate-500">
              {form.description.length}/2000 characters · Minimum 30
            </p>

            <FieldError name="description" errors={errors} />
          </div>

          <div>
            <label
              htmlFor="category"
              className="text-sm font-semibold"
            >
              Main category
            </label>

            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className={inputClass}
              {...fieldAccessibility("category")}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <FieldError name="category" errors={errors} />
          </div>

          <div>
            <label htmlFor="skills" className="text-sm font-semibold">
              Skills, separated by commas
            </label>

            <input
              id="skills"
              name="skills"
              value={form.skills}
              onChange={handleChange}
              placeholder="React, Node.js, MongoDB"
              required
              maxLength={500}
              className={inputClass}
              {...fieldAccessibility("skills")}
            />

            <FieldError name="skills" errors={errors} />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="startingPrice"
                className="text-sm font-semibold"
              >
                Starting price (USD)
              </label>

              <input
                id="startingPrice"
                name="startingPrice"
                type="number"
                value={form.startingPrice}
                onChange={handleChange}
                required
                min={1}
                max={1000000}
                step={1}
                className={inputClass}
                {...fieldAccessibility("startingPrice")}
              />

              <FieldError name="startingPrice" errors={errors} />
            </div>

            <div>
              <label
                htmlFor="deliveryDays"
                className="text-sm font-semibold"
              >
                Delivery time (days)
              </label>

              <input
                id="deliveryDays"
                name="deliveryDays"
                type="number"
                value={form.deliveryDays}
                onChange={handleChange}
                required
                min={1}
                max={365}
                step={1}
                className={inputClass}
                {...fieldAccessibility("deliveryDays")}
              />

              <FieldError name="deliveryDays" errors={errors} />
            </div>
          </div>

          {submitError && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 p-4 text-red-700"
            >
              {submitError}
            </p>
          )}

          {success && (
            <p
              role="status"
              className="rounded-xl bg-emerald-50 p-4 text-emerald-700"
            >
              {success}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-wait disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save profile"}
            </button>

            <button
              type="button"
              onClick={handleStatusChange}
              disabled={
                busy ||
                !hasProfile ||
                (status !== "Published" && hasUnsavedChanges)
              }
              className="rounded-xl border border-violet-300 px-6 py-3 font-semibold text-violet-700 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {changingStatus
                ? "Updating..."
                : status === "Published"
                ? "Unpublish profile"
                : "Publish profile"}
            </button>
          </div>

          <p className="text-sm text-slate-500">
            {hasUnsavedChanges
              ? "You have unsaved changes. Save them before publishing."
              : !hasProfile
              ? "Save your profile first to enable publishing."
              : status === "Published"
              ? "Your saved profile is visible in Discover Talent."
              : "Your saved profile is ready to publish."}
          </p>
        </fieldset>
      </form>
    </section>
  );
}