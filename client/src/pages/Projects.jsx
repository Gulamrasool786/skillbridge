import { Link } from "react-router";
import { useProjects } from "../context/ProjectsContext.js";

const formatBudget = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

function Projects() {
  const {
    projects,
    loading,
    error,
    retryLoading,
  } = useProjects();
  if (loading) {
  return (
    <p role="status" className="text-slate-500">
      Loading your projects...
    </p>
  );
}

if (error) {
  return (
    <section className="rounded-2xl border border-red-200 bg-white p-8">
      <h1 className="text-2xl font-semibold">
        Could not load projects
      </h1>

      <p role="alert" className="mt-3 text-red-700">
        {error}
      </p>

      <button
        type="button"
        onClick={retryLoading}
        className="mt-5 rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"
      >
        Try again
      </button>
    </section>
  );
}

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            My projects
          </h1>

          <p className="mt-3 text-slate-500">
            Your ideas, ready for their next step.
          </p>
        </div>

        <Link
          to="/projects/new"
          className="rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"
        >
          + New project
        </Link>
      </div>

      <p className="mt-5 text-sm text-slate-500">
       Development workspace · Drafts are stored in MongoDB 
      </p>

      {projects.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-xl font-semibold">
            Give your first idea a home.
          </h2>

          <p className="mt-3 text-slate-500">
            Select New project to write your brief.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <article
              key={project.id}
              className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm text-violet-700">
                  {project.category}
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {project.status}
                </span>
              </div>

              <h2 className="mt-4 text-xl font-semibold break-words">
                {project.title}
              </h2>

              <p className="mt-3 whitespace-pre-wrap leading-7 break-words text-slate-500">
                {project.description}
              </p>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <p className="text-sm text-slate-500">
                  Planned budget
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {formatBudget(project.budget)}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Projects;