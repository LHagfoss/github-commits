import * as react from 'react';
import { CSSProperties } from 'react';

type ContributionLevel = 0 | 1 | 2 | 3 | 4;
interface ContributionDay {
    date: string;
    count: number;
    level: ContributionLevel;
}
interface UseGitHubContributionsOptions {
    username: string;
    year?: "last" | number;
    endpoint?: string;
}
declare function useGitHubContributions({ username, year, endpoint, }: UseGitHubContributionsOptions): {
    contributions: ContributionDay[];
    loading: boolean;
    error: Error | null;
};
interface GitHubCommitsProps extends UseGitHubContributionsOptions {
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
declare function GitHubCommits({ username, year, endpoint, className, style, profileUrl, weeks, showFooter, colors, loadingLabel, errorLabel, }: GitHubCommitsProps): react.JSX.Element;

export { type ContributionDay, type ContributionLevel, GitHubCommits, type GitHubCommitsProps, type UseGitHubContributionsOptions, useGitHubContributions };
