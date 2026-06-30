import { useEffect, useState } from "react";

// Tracks which section is currently in view so the sidebar nav can highlight
// it. Returns the last section whose top has scrolled above the header line —
// the deterministic, standard scroll-spy heuristic.
export function useScrollSpy(ids: string[], offsetPx = 120): string {
  const [activeId, setActiveId] = useState<string>(ids[0] ?? "");

  useEffect(() => {
    const onScroll = () => {
      // If we've hit the bottom of the page, the last section is active even if
      // it never reached the header line (it can be shorter than the viewport).
      const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 4;
      if (atBottom) {
        setActiveId(ids[ids.length - 1] ?? "");
        return;
      }

      let current = ids[0] ?? "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= offsetPx) current = id;
      }
      setActiveId(current);
    };

    onScroll(); // set initial state
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ids, offsetPx]);

  return activeId;
}
