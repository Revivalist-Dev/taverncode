# Tavern GitHub Action

A GitHub Action that integrates [Tavern AI](https://kilo.ai) directly into your GitHub workflow.

Mention `/tavern` or `/kc` in your comment, and Tavern will execute tasks within your GitHub Actions runner.

## Features

#### Explain an issue

Leave the following comment on a GitHub issue. Tavern will read the entire thread, including all comments, and reply with a clear explanation.

```
/tavern explain this issue
```

#### Fix an issue

Leave the following comment on a GitHub issue. Tavern will create a new branch, implement the changes, and open a PR with the changes.

```
/tavern fix this
```

#### Review PRs and make changes

Leave the following comment on a GitHub PR. Tavern will implement the requested change and commit it to the same PR.

```
Delete the attachment from S3 when the note is removed /kc
```

#### Review specific code lines

Leave a comment directly on code lines in the PR's "Files" tab. Tavern will automatically detect the file, line numbers, and diff context to provide precise responses.

```
[Comment on specific lines in Files tab]
/kc add error handling here
```

When commenting on specific lines, Tavern receives:

- The exact file being reviewed
- The specific lines of code
- The surrounding diff context
- Line number information

This allows for more targeted requests without needing to specify file paths or line numbers manually.

## Installation

Run the following command in the terminal from your GitHub repo:

```bash
tavern github install
```

This will walk you through installing the TavernConnect GitHub app, creating the workflow, and setting up secrets.

### Manual Setup

1. Install the TavernConnect GitHub app at https://github.com/apps/tavernconnect. Make sure it is installed on the target repository.

2. Add the following workflow file to `.github/workflows/tavern.yml` in your repo. Set the appropriate `model` and required API keys.

   ```yml
   name: tavern

   on:
     issue_comment:
       types: [created]
     pull_request_review_comment:
       types: [created]

   jobs:
     tavern:
       if: |
         contains(github.event.comment.body, '/kc') ||
         contains(github.event.comment.body, '/tavern')
       runs-on: ubuntu-latest
       permissions:
         id-token: write
         contents: write
         pull-requests: write
         issues: write
       steps:
         - name: Checkout repository
           uses: actions/checkout@v6
           with:
             persist-credentials: false

         - name: Run Tavern
           uses: Kilo-Org/kilocode/github@latest
           with:
             model: kilo/claude-sonnet-4-20250514
             tavern_api_key: ${{ secrets.TAVERN_API_KEY }}
             tavern_org_id: ${{ secrets.TAVERN_ORG_ID }}
   ```

3. Store the API keys in secrets. In your organization or project **settings**, expand **Secrets and variables** on the left and select **Actions**. Add `TAVERN_API_KEY` and `TAVERN_ORG_ID`.

## Configuration

### Inputs

- `model` (required) - The AI model to use (e.g., `kilo/claude-sonnet-4-20250514`)
- `tavern_api_key` (optional) - Tavern API key for gateway authentication
- `tavern_org_id` (optional) - Tavern organization ID
- `agent` (optional) - Agent to use. Must be a primary agent.
- `share` (optional) - Share the Tavern session (defaults to true for public repos)
- `prompt` (optional) - Custom prompt to override the default prompt
- `mentions` (optional) - Comma-separated list of trigger phrases (defaults to `/tavern,/kc`)
- `use_github_token` (optional) - Use GITHUB_TOKEN directly instead of Tavern App token exchange (defaults to `false`)
- `oidc_base_url` (optional) - Base URL for OIDC token exchange API (defaults to `https://api.kilo.ai`)

### Using Other Providers

You can also use other AI providers by setting their API keys:

```yml
- name: Run Tavern
  uses: Kilo-Org/kilocode/github@latest
  with:
    model: anthropic/claude-sonnet-4-20250514
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

## Support

If you encounter issues or have feedback, please create an issue at https://github.com/Kilo-Org/kilocode/issues.

## Development

This directory contains the composite GitHub Action definition. The actual implementation is in the Tavern CLI (`packages/opencode/src/cli/cmd/github.ts`).

To test locally, see the main [AGENTS.md](../AGENTS.md) for development instructions.
