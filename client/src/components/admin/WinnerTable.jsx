import { useState, useEffect } from "react";
import {
  getWinners,
  markKycPassed,
  markKycFailed,
  runRanking,
} from "../../api/adminService";

export default function WinnerTable() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadWinners();
  }, []);

  async function loadWinners() {
    setLoading(true);
    const result = await getWinners();
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
    const result = await markKycPassed(winnerId);
    if (result.success) {
      loadWinners();
    } else {
      setMessage(result.message || "Could not mark KYC passed");
    }
  }

  async function handleFail(winnerId) {
    const result = await markKycFailed(winnerId);
    if (result.success) {
      loadWinners();
    } else {
      setMessage(result.message || "Could not mark KYC failed");
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Winners</h2>
        <button
          onClick={handleRunRanking}
          className="bg-indigo-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-indigo-700"
        >
          Run ranking
        </button>
      </div>

      {loading && <p className="text-sm text-slate-500 mb-3">Loading...</p>}
      {message && <p className="text-sm text-slate-600 mb-3">{message}</p>}

      <table className="w-full text-sm bg-white border border-slate-200 rounded-md overflow-hidden">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            <th className="px-4 py-2">Tier</th>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">User</th>
            <th className="px-4 py-2">Score</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {winners.map((winner) => (
            <tr key={winner.id} className="border-t border-slate-100">
              <td className="px-4 py-2">{winner.tier}</td>
              <td className="px-4 py-2">{winner.category || "-"}</td>
              <td className="px-4 py-2">{winner.userId}</td>
              <td className="px-4 py-2">{winner.score}</td>
              <td className="px-4 py-2">{winner.status}</td>
              <td className="px-4 py-2 flex gap-2">
                <button
                  onClick={() => handlePass(winner.id)}
                  className="text-green-700 border border-green-200 rounded-md px-2 py-1 text-xs hover:bg-green-50"
                >
                  Pass KYC
                </button>
                <button
                  onClick={() => handleFail(winner.id)}
                  className="text-red-700 border border-red-200 rounded-md px-2 py-1 text-xs hover:bg-red-50"
                >
                  Fail KYC
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
