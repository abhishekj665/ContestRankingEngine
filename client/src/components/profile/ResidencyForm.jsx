import { useState } from "react";
import { toast } from "react-toastify";
import { updateResidency } from "../../api/userService";

export default function ResidencyForm() {
  const [residency, setResidency] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const result = await updateResidency(residency);

    setLoading(false);
    if (result.success) {
      toast.success(result.message || "Residency updated successfully");
      return;
    }

    toast.error(result.message || "Could not update residency");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/60"
    >
      <h2 className="mb-2 text-xl font-semibold text-slate-900">
        Your residency
      </h2>

      <label className="block text-sm text-slate-600 mb-1">Residency</label>
      <input
        type="text"
        value={residency}
        onChange={(e) => setResidency(e.target.value)}
        placeholder="e.g. Chhattisgarh"
        required
        className="w-full border border-slate-300 rounded-md px-3 py-2 mb-4 text-sm"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
