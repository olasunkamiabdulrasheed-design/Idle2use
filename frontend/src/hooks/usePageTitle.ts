/** Sets document.title for the current page (no extra dependency). */

import { useEffect } from "react";

const BASE = "Idle2Use — Turn unused capacity into opportunity.";

export function usePageTitle(page?: string) {
  useEffect(() => {
    document.title = page ? `Idle2Use | ${page}` : BASE;
  }, [page]);
}
