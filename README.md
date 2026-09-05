# @lhagfoss/github-commits

A responsive, dependency-light GitHub contribution graph for React. It inherits your typography, requires no CSS import, and adapts the number of visible weeks to its container.

Hover a contribution square—or focus it with the keyboard—to reveal the exact count and date with a smooth tooltip.

## Install

```bash
bun add @lhagfoss/github-commits
```

Until the npm release is available, install directly from GitHub:

```bash
bun add git+ssh://git@github.com/LHagfoss/github-commits.git
```

## Use

```tsx
import { GitHubCommits } from "@lhagfoss/github-commits";

export function Activity() {
  return <GitHubCommits username="lhagfoss" />;
}
```

Customize the graph without coupling it to Tailwind or another CSS framework:

```tsx
<GitHubCommits
  username="lhagfoss"
  weeks={53}
  colors={["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"]}
  showFooter
  contributionLabel="commit"
  className="github-activity"
/>
```

For your own markup, use the data hook:

```tsx
import { useGitHubContributions } from "@lhagfoss/github-commits";

const { contributions, loading, error } = useGitHubContributions({
  username: "lhagfoss",
});
```

## Data source

By default, this component reads public contribution data from `github-contributions-api.jogruber.de`. You can pass an alternative `endpoint` that returns the same `{ contributions: [...] }` shape.

## Publish

```bash
npm login
npm publish --access public
```
