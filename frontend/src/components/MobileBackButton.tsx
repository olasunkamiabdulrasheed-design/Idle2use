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
      className="mb-4 inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2 text-sm font-bold text-mist-200 transition-colors hover:bg-white/[0.08] lg:hidden"
    >
      <ArrowLeft className="h-4 w-4" /> {label}
    </button>
  );
}
