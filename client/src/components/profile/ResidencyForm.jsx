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
      className="bg-white border border-slate-200 rounded-md p-6 max-w-sm w-full"
    >
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
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
        className="w-full bg-indigo-600 text-white rounded-md py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
