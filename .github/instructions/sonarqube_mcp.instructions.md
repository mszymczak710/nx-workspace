---
applyTo: '**/*'
---

These are some guidelines when using the SonarQube MCP server.

# Important Tool Guidelines

## Basic usage

- **IMPORTANT**: After you finish generating or modifying any code files at the very end of the task, you MUST call the `analyze_file_list` tool (if it exists) to analyze the files you created or modified.
- **Automatic analysis is intentionally disabled for this project — leave it off.** Do not call `toggle_automatic_analysis` to enable it, even at the start/end of a task. The reason: this repo's SonarCloud analysis is already performed by the `sonar` job in [ci.yml](../workflows/ci.yml) (`sonar-scanner`, run after `test` uploads coverage), so a second, MCP-driven automatic analysis would be redundant and can produce conflicting/duplicate results. For local, ad-hoc feedback use `analyze_file_list` on the files you touched, or run `npm run sonar` — don't switch on the always-on mode.

## Project Keys

- When a user mentions a project key, use `search_my_sonarqube_projects` first to find the exact project key
- Don't guess project keys - always look them up

## Code Language Detection

- When analyzing code snippets, try to detect the programming language from the code syntax
- If unclear, ask the user or make an educated guess based on syntax

## Branch and Pull Request Context

- Many operations support branch-specific analysis
- If user mentions working on a feature branch, include the branch parameter

## Code Issues and Violations

- After fixing issues, do not attempt to verify them using `search_sonar_issues_in_projects`, as the server will not yet reflect the updates

# Common Troubleshooting

## Authentication Issues

- SonarQube requires USER tokens (not project tokens)
- When the error `SonarQube answered with Not authorized` occurs, verify the token type

## Project Not Found

- Use `search_my_sonarqube_projects` to find available projects
- Verify project key spelling and format

## Code Analysis Issues

- Ensure programming language is correctly specified
- Remind users that snippet analysis doesn't replace full project scans
- Provide full file content for better analysis results
