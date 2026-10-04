import { useState } from "react";
import { Link } from "react-router";
import SaveTalentButton from "../components/SaveTalentButton.jsx";
import useTalentResource from "../hooks/useTalentResource.js";
import TalentRequestState from "../components/TalentRequestState.jsx";

function Talent() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const { data, loading, error, retry } = useTalentResource("/api/talent");

    const freelancers = data?.freelancers ?? [];
    const categories = ["All", "Development", "Design", "Writing", "Marketing"];
    const normalizedSearch = search.trim().toLowerCase();

    const filteredFreelancers = freelancers.filter((freelancer)=>{
        const searchableText = [
            freelancer.name,
            freelancer.title,
            freelancer.category,
            ...freelancer.skills,
        ]
        .join(" ")
        .toLowerCase();

        const matchesSearch = searchableText.includes(normalizedSearch);
        const matchesCategory =
        category === "All" || freelancer.category === category;

        return matchesSearch && matchesCategory;
    });

    if(loading || error){
      return(
        <TalentRequestState
        loading={loading}
        error={error}
        retry={retry}
        />
      );
    }

   
  return (
    <section>
      <p className="text-xs font-semibold tracking-widest text-violet-600">
        FIND YOUR NEXT COLLABORATOR
      </p>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Discover talent
      </h1>

      <p className="mt-4 leading-7 text-slate-500">
        Explore specialists for your next project.
      </p>

      <p className="mt-2 text-sm text-slate-500">
        Published profiles . Prices in USD
      </p>

      <div className="mt-8">
        <label
        htmlFor="talent-search"
        className="mb-2 block text-sm font-medium text-slate-700"
         >
            Search talent
        </label>
        <input
        id="talent-search"
        type="search"
        value={search}
        onChange={(event)=> setSearch(event.target.value)}
        placeholder="Search by name, title, category, or skill"
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        />
        <div
        role="group"
        aria-label="Filter by category"
        className="mt-4 flex flex-wrap gap-2"
        >
            {categories.map((item)=>(
                <button
                key={item}
                type="button"
                aria-pressed={category === item}
                onClick={()=> setCategory(item)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    category === item
                    ? "border-violet-200 bg-violet-50 text-violet-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                } `}
                >
                    {item}

                </button>
            ))}

        </div>

        <p role="status" className="mt-4 text-sm text-slate-500">
            {filteredFreelancers.length}{" "}
            {filteredFreelancers.length === 1 ? "specialist" : "specialists"} found

        </p>

      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredFreelancers.map((freelancer) => (    
          <article
            key={freelancer.id}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-100 font-semibold text-violet-700">
                {freelancer.initials}
              </span>

              <div>
                <h2 className="font-semibold">{freelancer.name}</h2>

                <p className="mt-1 text-sm text-slate-500">
                  {freelancer.category}
                </p>
              </div>
            </div>

            <h3 className="mt-5 text-lg font-semibold leading-7">
              {freelancer.title}
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {freelancer.description}
            </p>

            <ul className="mt-5 flex flex-wrap gap-2">
              {freelancer.skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600"
                >
                  {skill}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <p className="text-sm text-slate-500">
                  {freelancer.deliveryDays}-day delivery
                </p>

                <p className="text-sm text-slate-500">
                  From{" "}
                  <strong className="text-lg text-slate-900">
                    ${freelancer.startingPrice}
                  </strong>
                </p>
              </div>
            </div>
            <Link
            to={`/talent/${freelancer.id}`}
            className="mt-5 block rounded-lg bg-violet-600 px-4 py-3  text-center text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              View profile
            </Link>
            <SaveTalentButton freelancerId={freelancer.id} />
          </article>
        ))}
      </div>

      {filteredFreelancers.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="text-xl font-semibold">
              {freelancers.length === 0
              ? "No published profiles yet"
              : "No matching specialists found"
              }
            </h2>
            <p className="mt-3 text-slate-500">
                {
                  freelancers.length === 0
                  ? "Freelancers will appear here after publishing thier profiles."
                  : "Try another search or choose a different category."
                }
            </p>
            <button 
            type="button"
            onClick={()=>{
                setSearch("");
                setCategory("All");
            }}
            className="mt-5 rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"
            >
                Clear filters

            </button>
        </div>
      )}
    </section>
  );
}

export default Talent;