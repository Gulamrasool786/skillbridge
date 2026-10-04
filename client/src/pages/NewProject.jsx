import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useProjects } from "../context/ProjectsContext.js";

const categories = ["Development", "Design", "Writing", "Marketing"];

const initialForm = {
  title: "",
  description: "",
  category: "",
  budget: "",
};

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

function NewProject() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    addProject,
    loading,
    error: projectsError,
  }= useProjects();
  const navigate = useNavigate();

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if(saving || loading || projectsError) {
      return;
    }

    setSubmitError("");

    const title = form.title.trim();
    const description = form.description.trim();
    const budget = Number(form.budget);
    const nextErrors = {};

    if (title.length < 5 || title.length > 100) {
      nextErrors.title = "Enter a title between 5 and 100 characters.";
    }

    if (description.length < 20 || description.length > 2000) {
      nextErrors.description =
        "Enter a description between 20 and 2,000 characters.";
    }

    if (!categories.includes(form.category)) {
      nextErrors.category = "Choose a service category.";
    }

    if (
      form.budget.trim() === "" ||
      !Number.isFinite(budget) ||
      !Number.isInteger(budget) ||
      budget < 1 ||
      budget > 1000000
    ) {
      nextErrors.budget =
        "Enter a whole-dollar budget between $1 and $1,000,000.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSaving(true);
    try{
      await addProject({
        title,
        description,
        category: form.category,
        budget,
      });
      navigate("/projects");
    } catch(error){
      setSubmitError(error.message);
      if(error.fieldErrors){
        setErrors(error.fieldErrors);
      }
    }finally{
      setSaving(false);
    }
  }

  return (
    <section className="max-w-3xl">
      <Link
        to="/projects"
        className="text-sm font-medium text-violet-700 hover:underline"
      >
        ← Back to projects
      </Link>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight">
        Make room for your next idea.
      </h1>

      <p className="mt-4 leading-7 text-slate-500">
        Start with a clear brief. Creating a draft does not hire
        a freelancer or take payment.
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-8 space-y-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
      >
        <div>
          <label htmlFor="project-title" className="font-medium">
            Project title
          </label>

          <input
            id="project-title"
            name="title"
            value={form.title}
            onChange={handleChange}
            maxLength={100}
            required
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "title-error" : undefined}
            placeholder="e.g. Website for my architecture studio"
            className={inputClass}
          />

          {errors.title && (
            <p id="title-error" className="mt-2 text-sm text-red-700">
              {errors.title}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="project-description" className="font-medium">
            Project description
          </label>

          <textarea
            id="project-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            maxLength={2000}
            required
            aria-invalid={Boolean(errors.description)}
            aria-describedby={
              errors.description ? "description-error" : undefined
            }
            placeholder="Describe your goals, audience, and required deliverables."
            className={`${inputClass} resize-y`}
          />

          {errors.description && (
            <p
              id="description-error"
              className="mt-2 text-sm text-red-700"
            >
              {errors.description}
            </p>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="project-category" className="font-medium">
              Category
            </label>

            <select
              id="project-category"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              aria-invalid={Boolean(errors.category)}
              aria-describedby={
                errors.category ? "category-error" : undefined
              }
              className={inputClass}
            >
              <option value="">Choose a category</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {errors.category && (
              <p
                id="category-error"
                className="mt-2 text-sm text-red-700"
              >
                {errors.category}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="project-budget" className="font-medium">
              Budget (USD, whole dollars)
            </label>

            <input
              id="project-budget"
              name="budget"
              type="number"
              min="1"
              max="1000000"
              step="1"
              value={form.budget}
              onChange={handleChange}
              required
              aria-invalid={Boolean(errors.budget)}
              aria-describedby={
                errors.budget ? "budget-error" : undefined
              }
              placeholder="1000"
              className={inputClass}
            />

            {errors.budget && (
              <p
                id="budget-error"
                className="mt-2 text-sm text-red-700"
              >
                {errors.budget}
              </p>
            )}
          </div>
        </div>

        {Object.keys(errors).length > 0 && (
          <p role="alert" className="text-sm text-red-700">
            Please correct the fields marked above.
          </p>
        )}

        <p className="text-sm leading-6 text-slate-500">
          Draft are saved to the database. Leaving this form discards any unsubmitted input.
        </p>
        {loading &&(
          <p role="status" className="text-sm text-slate-500">
            Loading your project workspace...
          </p>
        )}

        {projectsError &&(
          <p role="alert" className="text-sm text-red-700">
            Coul not load the workspace. Return to my Project and select Try again.
          </p>
        )}
        {
          submitError &&(
            <p role="alert" className="text-sm text-red-700">
              {submitError}
            </p>
          )
        }

        <button
          type="submit"
          disabled={saving || loading || projectsError}
          className="rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"
        >
          {saving ? "Saving project...":"Create draft project"}
        </button>
      </form>
    </section>
  );
}

export default NewProject;