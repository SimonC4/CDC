# Cambridge Darts Club — 180 leaderboard

A small, dependency-free static website. A dated Google Sheet row represents one 180 by default. The optional Count column supports opening totals and multiple 180s on a date. The browser calculates all-time totals, shared ranks (1, 2, 2, 4), and the ten latest records. Repeat rows count separately, including multiple 180s by the same player on one date. Names ignore letter case and extra spaces; use a consistent distinct name for each player.

## Current state

The website is published at https://simonc4.github.io/CDC/ and configured to read the dedicated, published Google Sheets Records tab. The initial sheet contains 12 fictional example records; replace these with club records before using the standings as real results. The site checks the sheet every minute while visible. An empty `sheetCsvUrl` in `config.js` enables the clearly labelled local sample mode.

## Connect Google Sheets

1. Create a dedicated spreadsheet named **Cambridge Darts Club — 180 Records (POC)**. Import the provided sample workbook (or import `sample-records.csv`) and name the tab **Records**.
2. Keep headers **Player** and **Date** in row 1. Optionally add **Count** in C1. For a starting total, enter the player and their count with Date blank. For a new single 180, enter the player and date and leave Count blank (or enter 1). Counts must be positive whole numbers. The sample names are fictional; remove the sample rows before recording real results.
3. Format the whole Date column with the custom date format **d mmm yyyy** (for example, `1 Sep 2026`); **yyyy-mm-dd** is also accepted. Use actual dates in the sheet. Keep the names consistent; two different players with the same name need distinguishable display names.
4. In **File → Share → Publish to web**, select the **Records** tab (not the entire document) and **Comma-separated values (.csv)**. Publish and leave **Automatically republish when changes are made** enabled.
5. Keep edit access restricted to the club organisers. Published names and dates can be read by anyone, so only put data intended for public display in this dedicated spreadsheet. Do not include contact details or membership information.
6. Copy the published CSV URL into `sheetCsvUrl` in `config.js`. The expected form is `https://docs.google.com/spreadsheets/d/e/PUBLISHED_ID/pub?gid=TAB_ID&single=true&output=csv`. Use the actual link Google supplies, not the ordinary edit/share link. Ensure it contains the selected tab's `gid` and `single=true`.
7. Save the configuration to GitHub once. Subsequent sheet edits need no website redeployment.

There are no API keys, passwords, paid services, or third-party CSV proxies. Visitors can read the published data but cannot edit the sheet through this website. Publishing is read-only exposure, not a way to keep the displayed records private.

## Free GitHub Pages hosting

1. Use the existing **SimonC4/CDC** repository. Make it public under **Settings → General → Danger Zone → Change repository visibility**, as authorised for this proof of concept.
2. Upload this folder's contents to the repository root. `index.html` must be at the root, not inside another folder. Include `.nojekyll` if using Git; it is optional for the supplied plain files.
3. Open **Settings → Pages**. Under **Build and deployment**, select **Deploy from a branch**, branch **main**, folder **/(root)**, and save.
4. Wait for the Pages deployment to succeed. GitHub displays the live website address on that page, expected to be `https://simonc4.github.io/CDC/` once enabled.

Use the free `github.io` address; no custom domain or paid plan is needed for a public repository. The public repository also exposes the public CSV URL, which is intentional. Never add account credentials to it.

## Confirm the live connection

Open the deployed site and confirm the sample banner disappears. With a sample-only sheet, add a row for `Refresh Test Example` with today's date. Leave the website open and wait for the next minute check plus Google's publication delay. Confirm the record appears and the total increases by one; then delete the test row and confirm it disappears. Check from a phone too.

The site polls once a minute while visible and checks immediately when you return to the tab. Google publication can take a few minutes, so this is automatic but not instant. **Refresh now** requests another check. Browser/network errors retain the last successful results with an explicit warning; they never silently substitute demo data. No results are stored in browser storage. A page reload without a connection shows an unavailable state.

Blank rows are ignored. Incomplete rows, invalid counts and dates in other formats are excluded with their row numbers shown. Undated starting totals require an explicit Count and never appear in Recent 180s or Latest maximum. Starting totals are added to every other row: exclude already-listed dated 180s from the starting total to avoid double counting. A zero starting total needs no row. Empty sheets display an empty board. Invalid CSV/header responses are treated as errors. Player names are inserted as text, never HTML. Future dates are accepted as entered; correct accidental future dates in the sheet.

## Sources

- [Google: Publish a sheet to the web](https://support.google.com/docs/answer/183965)
- [GitHub: Create a Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [GitHub: Configure the publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
