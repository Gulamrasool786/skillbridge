import { useState } from "react";

const overviewCards = [
  {
    title: "Projects",
    description: "Your briefs, milestones, and deliveries.",
  },
  {
    title: "Talent",
    description: "Find specialists and build your shortlist.",
  },
  {
    title: "Conversations",
    description: "Keep project discussions in one place.",
  },
];

function Overview() {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState(
    "Check that your workspace can reach the backend."
  );

  async function checkConnection() {
    setStatus("loading");
    setMessage("Connecting...");

    try {
      const response = await fetch("/api/health");

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();

      setMessage(data.message);
      setStatus("success");
    } catch (error) {
      console.error("Connection error:", error);

      setMessage("Could not connect. Check your backend terminal.");
      setStatus("error");
    }
  }

  const messageColor =
    status === "success"
      ? "text-emerald-700"
      : status === "error"
        ? "text-red-700"
        : "text-slate-500";

  return (
    <>
      <section>
        <p className="text-xs font-semibold tracking-widest text-violet-600">
          LET’S MAKE SOMETHING GREAT
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Your next chapter starts here.
        </h1>

        <p className="mt-4 max-w-2xl leading-7 text-slate-500">
          Bring your ideas, people, and progress together.
          This is the beginning of your SkillBridge workspace.
        </p>
      </section>

      <section
        aria-label="Planned workspace features"
        className="mt-8 grid gap-5 md:grid-cols-3"
      >
        {overviewCards.map((card) => (
          <article
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <span className="text-xs font-medium text-slate-500">
              Planned feature
            </span>

            <h2 className="mt-3 text-xl font-semibold">
              {card.title}
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {card.description}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-2xl border border-violet-200 bg-violet-50 p-6 sm:p-8">
        <h2 className="text-xl font-semibold">
          A connected foundation.
        </h2>

        <p className="mt-3 leading-7 text-slate-600">
          Your React frontend communicates with your Express API.
          Check the connection below.
        </p>

        <button
          onClick={checkConnection}
          disabled={status === "loading"}
          className="mt-5 rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-wait disabled:opacity-60"
        >
          {status === "loading"
            ? "Connecting..."
            : "Check backend connection"}
        </button>

        <p
          role="status"
          className={`mt-4 text-sm leading-6 ${messageColor}`}
        >
          {message}
        </p>
      </section>
    </>
  );
}

export default Overview;