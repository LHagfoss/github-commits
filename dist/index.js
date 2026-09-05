"use client";

// src/index.tsx
import {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { jsx, jsxs } from "react/jsx-runtime";
function useGitHubContributions({
  username,
  year = "last",
  endpoint = "https://github-contributions-api.jogruber.de/v4"
}) {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    async function load() {
      try {
        const url = `${endpoint.replace(/\/$/, "")}/${encodeURIComponent(username)}?y=${year}`;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`GitHub contributions request failed (${response.status})`);
        const result = await response.json();
        setContributions(result.contributions ?? []);
        setError(null);
      } catch (cause) {
        if (!(cause instanceof DOMException && cause.name === "AbortError")) {
          setError(cause instanceof Error ? cause : new Error("Could not load GitHub contributions"));
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [endpoint, username, year]);
  return { contributions, loading, error };
}
var defaultColors = [
  "#171717",
  "#404040",
  "#737373",
  "#d4d4d4",
  "#ffffff"
];
function GitHubCommits({
  username,
  year = "last",
  endpoint,
  className,
  style,
  profileUrl,
  weeks = 53,
  showFooter = true,
  colors = defaultColors,
  loadingLabel = "Loading activity\u2026",
  errorLabel = "Could not load activity.",
  contributionLabel = "contribution"
}) {
  const rootRef = useRef(null);
  const [visibleWeeks, setVisibleWeeks] = useState(weeks);
  const [activeDate, setActiveDate] = useState(null);
  const { contributions, loading, error } = useGitHubContributions({ username, year, endpoint });
  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;
    const update = () => {
      const width = element.clientWidth;
      setVisibleWeeks(Math.min(weeks, width < 360 ? 20 : width < 560 ? 36 : 53));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [weeks]);
  const days = useMemo(
    () => contributions.slice(-(visibleWeeks * 7)),
    [contributions, visibleWeeks]
  );
  const total = days.reduce((sum, day) => sum + day.count, 0);
  return /* @__PURE__ */ jsxs("div", { ref: rootRef, className, style: { width: "100%", ...style }, children: [
    loading ? /* @__PURE__ */ jsx("div", { "aria-label": loadingLabel, style: { height: 96, borderRadius: 4, background: colors[0] } }) : error ? /* @__PURE__ */ jsx("p", { role: "status", style: { margin: 0, opacity: 0.6 }, children: errorLabel }) : /* @__PURE__ */ jsx(
      "div",
      {
        role: "grid",
        "aria-label": `${total} GitHub contributions in the displayed period`,
        style: {
          display: "grid",
          width: "100%",
          gap: 4,
          gridTemplateColumns: `repeat(${Math.max(visibleWeeks, 1)}, minmax(0, 1fr))`,
          gridTemplateRows: "repeat(7, minmax(0, 1fr))",
          gridAutoFlow: "column"
        },
        children: days.map((day) => {
          const isActive = activeDate === day.date;
          const countLabel = `${contributionLabel}${day.count === 1 ? "" : "s"}`;
          return /* @__PURE__ */ jsx(
            "span",
            {
              role: "gridcell",
              tabIndex: 0,
              "aria-label": `${day.count} ${countLabel} on ${day.date}`,
              onPointerEnter: () => setActiveDate(day.date),
              onPointerLeave: () => setActiveDate(null),
              onFocus: () => setActiveDate(day.date),
              onBlur: () => setActiveDate(null),
              style: {
                position: "relative",
                zIndex: isActive ? 1 : 0,
                display: "block",
                aspectRatio: "1",
                borderRadius: 2,
                background: colors[day.level],
                outline: "none",
                cursor: "default",
                transform: isActive ? "scale(1.18)" : "scale(1)",
                transition: "transform 180ms cubic-bezier(0.22, 1, 0.36, 1), filter 180ms ease",
                filter: isActive ? "brightness(1.2)" : "brightness(1)"
              },
              children: /* @__PURE__ */ jsxs(
                "span",
                {
                  "aria-hidden": "true",
                  style: {
                    position: "absolute",
                    bottom: "calc(100% + 8px)",
                    left: "50%",
                    padding: "6px 8px",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    borderRadius: 6,
                    background: "#171717",
                    color: "#fafafa",
                    fontSize: 12,
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? "translate(-50%, 0) scale(1)" : "translate(-50%, 4px) scale(0.96)",
                    transformOrigin: "bottom center",
                    transition: "opacity 140ms ease, transform 180ms cubic-bezier(0.22, 1, 0.36, 1)",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)"
                  },
                  children: [
                    day.count,
                    " ",
                    countLabel,
                    " \xB7 ",
                    day.date
                  ]
                }
              )
            },
            day.date
          );
        })
      }
    ),
    showFooter && /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 12, opacity: 0.6 }, children: [
      /* @__PURE__ */ jsx("span", { children: loading ? loadingLabel : error ? errorLabel : `${total} contributions` }),
      /* @__PURE__ */ jsxs("a", { href: profileUrl ?? `https://github.com/${username}`, target: "_blank", rel: "noopener noreferrer", style: { color: "inherit" }, children: [
        "@",
        username
      ] })
    ] })
  ] });
}
export {
  GitHubCommits,
  useGitHubContributions
};
