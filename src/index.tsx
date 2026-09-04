"use client";

import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export interface ContributionDay {
  date: string;
  count: number;
  level: ContributionLevel;
}

export interface UseGitHubContributionsOptions {
  username: string;
  year?: "last" | number;
  endpoint?: string;
}

export function useGitHubContributions({
  username,
  year = "last",
  endpoint = "https://github-contributions-api.jogruber.de/v4",
}: UseGitHubContributionsOptions) {
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    async function load() {
      try {
        const url = `${endpoint.replace(/\/$/, "")}/${encodeURIComponent(username)}?y=${year}`;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`GitHub contributions request failed (${response.status})`);
        const result = (await response.json()) as { contributions?: ContributionDay[] };
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

export interface GitHubCommitsProps extends UseGitHubContributionsOptions {
  className?: string;
  style?: CSSProperties;
  profileUrl?: string;
  weeks?: number;
  showFooter?: boolean;
  colors?: ColorPalette;
  loadingLabel?: string;
  errorLabel?: string;
}

type ColorPalette = [string, string, string, string, string];

const defaultColors: ColorPalette = [
  "#171717",
  "#404040",
  "#737373",
  "#d4d4d4",
  "#ffffff",
];

export function GitHubCommits({
  username,
  year = "last",
  endpoint,
  className,
  style,
  profileUrl,
  weeks = 53,
  showFooter = true,
  colors = defaultColors,
  loadingLabel = "Loading activity…",
  errorLabel = "Could not load activity.",
}: GitHubCommitsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [visibleWeeks, setVisibleWeeks] = useState(weeks);
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
    [contributions, visibleWeeks],
  );
  const total = days.reduce((sum, day) => sum + day.count, 0);

  return (
    <div ref={rootRef} className={className} style={{ width: "100%", ...style }}>
      {loading ? (
        <div aria-label={loadingLabel} style={{ height: 96, borderRadius: 4, background: colors[0] }} />
      ) : error ? (
        <p role="status" style={{ margin: 0, opacity: 0.6 }}>{errorLabel}</p>
      ) : (
        <div
          role="img"
          aria-label={`${total} GitHub contributions in the displayed period`}
          style={{
            display: "grid",
            width: "100%",
            gap: 4,
            gridTemplateColumns: `repeat(${Math.max(visibleWeeks, 1)}, minmax(0, 1fr))`,
            gridTemplateRows: "repeat(7, minmax(0, 1fr))",
            gridAutoFlow: "column",
          }}
        >
          {days.map((day) => (
            <span
              key={day.date}
              title={`${day.count} contributions on ${day.date}`}
              style={{ aspectRatio: "1", borderRadius: 2, background: colors[day.level] }}
            />
          ))}
        </div>
      )}
      {showFooter && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 12, opacity: 0.6 }}>
          <span>{loading ? loadingLabel : error ? errorLabel : `${total} contributions`}</span>
          <a href={profileUrl ?? `https://github.com/${username}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>
            @{username}
          </a>
        </div>
      )}
    </div>
  );
}
