# Publishing the extension

Every release is built by GitHub Actions (`.github/workflows/vscode.yml`) from a tag:

1. Update `version` in `editors/vscode/package.json` and add a section to `CHANGELOG.md`.
2. Commit, then tag and push:

   ```bash
   git tag vscode-v0.1.0
   git push origin vscode-v0.1.0
   ```

That always creates a GitHub Release with the `.vsix` file (the website's download button points
there). Publishing to the marketplaces happens too once they are set up below. Both are free.

## Open VSX (Cursor, Windsurf, VSCodium)

1. Sign in at https://open-vsx.org with GitHub.
2. In your profile, sign the **Eclipse Foundation Publisher Agreement**.
3. Create an **access token** (Settings → Access Tokens).
4. Create the `asomiya` namespace once: `npx ovsx@1.3.0 create-namespace asomiya -p <token>`.
5. In the GitHub repository: **Settings → Environments → New environment** `marketplaces`.
   Add the secret `OVSX_PAT` (the token) there, and the repository variable
   `PUBLISH_OPEN_VSX` = `true` (**Settings → Secrets and variables → Actions → Variables**).

## VS Code Marketplace

Personal access tokens for the Marketplace are retired on 1 December 2026, so the workflow signs
in with Microsoft Entra ID instead (no secret is stored anywhere).

1. Create a publisher with the ID `asomiya` at https://marketplace.visualstudio.com/manage
   (sign in with a Microsoft account). If that ID is taken, pick another and change `publisher`
   in `editors/vscode/package.json` (the website picks it up automatically).
2. In the Azure portal (free account), **Microsoft Entra ID → App registrations → New
   registration**, name it `asomiya-publisher`.
3. In that app: **Certificates & secrets → Federated credentials → Add**, scenario _GitHub Actions_,
   organization `d43ash1sh`, repository `asomiya`, entity _Environment_, name `marketplaces`.
4. In the Marketplace publisher page, **Members → Add**, and add the app (by its Application ID)
   as **Contributor**.
5. Add repository variables `AZURE_CLIENT_ID` (the app's Application ID), `AZURE_TENANT_ID`
   (Directory ID) and `PUBLISH_VS_MARKETPLACE` = `true`.

## Uploading by hand

You can always publish a release without any of the setup above: download the `.vsix` from the
GitHub Release, open https://marketplace.visualstudio.com/manage/publishers/asomiya, and use
**⋯ → Update** on the extension (or **New extension → Visual Studio Code** the first time).
Microsoft verifies each upload for a few minutes before it goes public.

Never delete and re-push a release tag: GitHub turns its release into a hidden draft. Bump the
version instead.

## After the first publish

Fill in `marketplace` and `openVsx` in `EXTENSION` (`website/site.config.mjs`):

```js
marketplace: 'https://marketplace.visualstudio.com/items?itemName=asomiya.asomiya',
openVsx: 'https://open-vsx.org/extension/asomiya/asomiya',
```

The extension page then shows an **Install** button instead of the `.vsix` download.
