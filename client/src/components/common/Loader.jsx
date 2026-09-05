export default function Loader({ message = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-2 py-4 text-sm text-slate-500">
      <span className="h-5 w-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
      <span>{message}</span>
    </div>
  );
}
