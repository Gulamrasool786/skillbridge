import { Link } from "react-router";
import { useSavedTalent } from "../context/SavedTalentContext.js";
import SaveTalentButton from "../components/SaveTalentButton.jsx";
import useTalentResource from "../hooks/useTalentResource.js";
import TalentRequestState from "../components/TalentRequestState.jsx";

function SavedTalent() {
  const { savedIds } = useSavedTalent();

  const { data, loading, error, retry } =
    useTalentResource("/api/talent");

  const freelancers = data?.freelancers ?? [];

  const savedFreelancers = freelancers.filter((freelancer) =>
    savedIds.includes(freelancer.id)
  );

  if (loading || error) {
    return (
      <TalentRequestState
        loading={loading}
        error={error}
        retry={retry}
      />
    );
  }

  // Your existing main return (...) goes here.

  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">
        Saved talent
      </h1>

      <p className="mt-4 leading-7 text-slate-500">
          Only profiles that are currently published appear here.
      </p>

      <p className="mt-2 text-sm text-slate-500">
        Learning preview: this shortlist resets when you refresh.
      </p>

      <p role="status" className="mt-5 text-sm text-violet-700">
        {savedFreelancers.length} saved
      </p>

      {savedFreelancers.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-xl font-semibold">
            Your shortlist starts here.
          </h2>

          <p className="mt-3 text-slate-500">
            Save a freelancer from the directory or their profile.
          </p>

          <Link
            to="/talent"
            className="mt-5 inline-block rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Discover talent
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {savedFreelancers.map((freelancer) => (
            <article
              key={freelancer.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-100 font-semibold text-violet-700">
                  {freelancer.initials}
                </span>

                <div>
                  <h2 className="font-semibold">
                    {freelancer.name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {freelancer.category}
                  </p>
                </div>
              </div>

              <p className="mt-5 leading-7 text-slate-600">
                {freelancer.title}
              </p>

              <div className="mt-auto pt-5">
                <Link
                  to={`/talent/${freelancer.id}`}
                  className="block rounded-lg bg-violet-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-violet-700"
                >
                  View profile
                </Link>

                <SaveTalentButton freelancerId={freelancer.id} />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default SavedTalent;