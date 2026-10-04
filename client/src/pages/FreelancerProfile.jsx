import { Link, useParams } from "react-router";
import useTalentResource from "../hooks/useTalentResource.js";
import TalentRequestState from "../components/TalentRequestState.jsx";
import SaveTalentButton from "../components/SaveTalentButton.jsx";
import MessageFreelancerButton from "../components/MessageFreelancerButton.jsx";

export default function FreelancerProfile() {
  const { freelancerId } = useParams();

  const { data, loading, error, notFound, retry } =
    useTalentResource(
      `/api/talent/${encodeURIComponent(freelancerId)}`
    );

  const freelancer = data?.freelancer;

  if (loading || (error && !notFound)) {
    return (
      <TalentRequestState
        loading={loading}
        error={error}
        retry={retry}
      />
    );
  }

  if (!freelancer) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8">
        <h1 className="text-2xl font-semibold">
          Freelancer unavailable
        </h1>

        <p className="mt-3 text-slate-500">
          This profile may have been unpublished or removed.
        </p>

        <Link
          to="/talent"
          className="mt-5 inline-block font-medium text-violet-700 underline"
        >
          Back to talent
        </Link>
      </section>
    );
  }

  return (
    <section>
      <Link
        to="/talent"
        className="text-sm font-medium text-violet-700 hover:underline"
      >
        ← Back to talent
      </Link>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 xl:col-span-2">
          <p className="text-xs font-semibold tracking-widest text-violet-600">
            FREELANCER PROFILE
          </p>

          <div className="mt-6 flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xl font-semibold text-violet-700">
              {freelancer.initials}
            </span>

            <div className="min-w-0">
              <h1 className="break-words text-2xl font-semibold">
                {freelancer.name}
              </h1>
              <p className="mt-1 text-slate-500">
                {freelancer.category}
              </p>
            </div>
          </div>

          <h2 className="mt-8 break-words text-2xl font-semibold leading-9">
            {freelancer.title}
          </h2>

          <p className="mt-4 whitespace-pre-wrap break-words leading-7 text-slate-600">
            {freelancer.description}
          </p>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <h2 className="text-lg font-semibold">
              Skills and expertise
            </h2>

            <ul className="mt-4 flex flex-wrap gap-2">
              {freelancer.skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-full bg-violet-50 px-4 py-2 text-sm text-violet-700"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        </article>

        <aside className="self-start rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Service overview</h2>

          <dl className="mt-6 space-y-5">
            <div>
              <dt className="text-sm text-slate-500">Starting price</dt>
              <dd className="mt-1 text-3xl font-semibold">
                ${freelancer.startingPrice}
                <span className="ml-2 text-sm font-normal text-slate-500">
                  USD
                </span>
              </dd>
            </div>

            <div>
              <dt className="text-sm text-slate-500">
                Estimated delivery
              </dt>
              <dd className="mt-1 font-medium">
                {freelancer.deliveryDays} days
              </dd>
            </div>

            <div>
              <dt className="text-sm text-slate-500">Category</dt>
              <dd className="mt-1 font-medium">
                {freelancer.category}
              </dd>
            </div>
          </dl>

          <MessageFreelancerButton profileId={freelancer.id} />
          <SaveTalentButton freelancerId={freelancer.id} />

          <p className="mt-6 border-t border-slate-100 pt-5 text-sm leading-6 text-slate-500">
            Discuss your project through messages.
            Hiring and payments are not available yet.
          </p>
        </aside>
      </div>
    </section>
  );
}