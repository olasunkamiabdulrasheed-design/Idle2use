/** Reusable mobile back control — navigates to the known parent route
 * (never window.history.back(), so deep links keep working). */

import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MobileBackButton({
  to = "/app",
  label = "Back",
}: {
  to?: string;
  label?: string;
}) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none lg:hidden"
    >
      <ArrowLeft className="h-4 w-4" /> {label}
    </button>
  );
}
