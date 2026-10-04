export default function TalentRequestState({
  loading,
  error,
  retry,
}) {
  if (loading) {
    return (
      <p role="status" className="text-slate-500">
        Loading talent...
      </p>
    );
  }

  if (!error) return null;

  return (
    <section className="rounded-2xl border border-red-200 bg-white p-8">
      <h1 className="text-2xl font-semibold">
        Could not load talent
      </h1>

      <p role="alert" className="mt-3 text-red-700">
        {error}
      </p>

      <button
        type="button"
        onClick={retry}
        className="mt-5 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-700"
      >
        Try again
      </button>
    </section>
  );
}