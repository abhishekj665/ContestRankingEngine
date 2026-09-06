import { useState, useEffect } from "react";
import {
  getWinners,
  requestKyc,
  markKycPassed,
  markKycFailed,
  runRanking,
} from "../../api/adminService";

export default function WinnerTable() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [busyWinnerId, setBusyWinnerId] = useState("");
  const [selectedTier, setSelectedTier] = useState("");

  useEffect(() => {
    loadWinners(selectedTier);
  }, [selectedTier]);

  async function loadWinners(tier = selectedTier) {
    setLoading(true);
    const result = await getWinners(tier);
    setLoading(false);

    if (result.success) {
      setWinners(result.data);
    } else {
      setMessage(result.message || "Could not load winners");
    }
  }

  async function handleRunRanking() {
    setMessage("");
    setLoading(true);
    const result = await runRanking();
    setLoading(false);

    if (result.success) {
      setMessage("Ranking run complete");
      loadWinners();
    } else {
      setMessage(result.message || "Ranking run failed");
    }
  }

  async function handlePass(winnerId) {
    setBusyWinnerId(winnerId);
    const result = await markKycPassed(winnerId);
    setBusyWinnerId("");
    if (result.success) {
      loadWinners();
    } else {
      setMessage(result.message || "Could not mark KYC passed");
    }
  }

  async function handleRequestKyc(winnerId) {
    setBusyWinnerId(winnerId);
    const result = await requestKyc(winnerId);
    setBusyWinnerId("");
    if (result.success) {
      setMessage("KYC request sent");
      loadWinners();
    } else {
      setMessage(result.message || "Could not send KYC request");
    }
  }

  async function handleFail(winnerId) {
    if (!window.confirm("Mark this winner as failed? The next eligible user will receive the prize.")) return;
    setBusyWinnerId(winnerId);
    const result = await markKycFailed(winnerId);
    setBusyWinnerId("");
    if (result.success) {
      loadWinners();
    } else {
      setMessage(result.message || "Could not mark KYC failed");
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-700 to-violet-700 p-6 text-white shadow-lg shadow-indigo-100 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-100">Admin dashboard</p>
          <h2 className="mt-1 text-2xl font-bold">Contest winners</h2>
          <p className="mt-1 text-sm text-indigo-100">Review the latest ranking run and complete KYC decisions.</p>
        </div>
        <button
          onClick={handleRunRanking}
          disabled={loading}
          title="Creates a new ranking snapshot; the table shows only its winners."
          className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Running..." : "Run ranking"}
        </button>
      </div>

      {loading && <p className="mb-3 text-sm text-slate-500">Loading latest winners...</p>}
      {message && <p className="mb-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">{message}</p>}

      <label className="mb-4 flex max-w-xs flex-col gap-1 text-sm font-medium text-slate-700">
        View winners by tier
        <select
          value={selectedTier}
          onChange={(event) => setSelectedTier(event.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal text-slate-700 shadow-sm"
        >
          <option value="">All tiers</option>
          <option value="GRAND">Grand Prize</option>
          <option value="CONSISTENCY_1">Consistency 1st</option>
          <option value="CONSISTENCY_2">Consistency 2nd</option>
          <option value="TOP_PERFORMER">Top Performers</option>
          <option value="CATEGORY_1ST">Category 1st</option>
          <option value="CATEGORY_2ND">Category 2nd</option>
        </select>
      </label>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            <th className="px-5 py-3">Tier</th>
            <th className="px-5 py-3">Category</th>
            <th className="px-5 py-3">User</th>
            <th className="px-5 py-3">Score</th>
            <th className="px-5 py-3">KYC status</th>
            <th className="px-5 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {winners.map((winner) => (
            <tr key={winner.id} className="border-t border-slate-100 transition hover:bg-slate-50/70">
              <td className="px-5 py-4 font-semibold text-slate-800">{winner.tier.replaceAll("_", " ")}</td>
              <td className="px-5 py-4 text-slate-600">{winner.category || "—"}</td>
              <td className="px-5 py-4 font-mono text-xs text-slate-600">{winner.userId}</td>
              <td className="px-5 py-4 font-semibold text-slate-800">{winner.score.toFixed(1)}</td>
              <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${winner.status === "PASSED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{winner.status === "PENDING_KYC" ? (winner.kycRequestedAt ? "KYC REQUESTED" : "PENDING KYC") : winner.status}</span></td>
              <td className="flex gap-2 px-5 py-4">
                {winner.status === "PENDING_KYC" && !winner.kycRequestedAt && <button
                  onClick={() => handleRequestKyc(winner.id)}
                  disabled={busyWinnerId === winner.id}
                  className="rounded-lg border border-indigo-200 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
                >
                  {busyWinnerId === winner.id ? "Sending..." : "Send KYC"}
                </button>}
                {winner.status === "PENDING_KYC" && winner.kycRequestedAt && <><button
                  onClick={() => handlePass(winner.id)}
                  disabled={busyWinnerId === winner.id}
                  className="rounded-lg border border-green-200 px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-50"
                >
                  {busyWinnerId === winner.id ? "Saving..." : "Pass"}
                </button>
                <button
                  onClick={() => handleFail(winner.id)}
                  disabled={busyWinnerId === winner.id}
                  className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  Fail
                </button></>}
              </td>
            </tr>
          ))}
          {!loading && winners.length === 0 && (
            <tr>
              <td colSpan="6" className="px-4 py-10 text-center text-slate-500">
                No winners in the latest ranking run.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
