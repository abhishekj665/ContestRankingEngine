import ResidencyForm from "../components/profile/ResidencyForm";

export default function ProfilePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="mb-7 max-w-sm text-center">
        <p className="text-sm font-medium text-indigo-600">Contest eligibility</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Your profile</h1>
        <p className="mt-2 text-sm text-slate-500">Set your residency to keep your eligibility information current.</p>
      </div>
      <ResidencyForm />
    </div>
  );
}
