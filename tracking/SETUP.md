# Turning on site tracking

The site counts page visits, booking forms filled in, "Call" taps (and for
which session) and WhatsApp taps, and stores them in a Google Sheet you own.
No names or phone numbers are recorded. Until the steps below are done,
tracking is off and the site sends nothing.

## One-time setup (about 5 minutes)

1. Open [sheets.new](https://sheets.new) to create a Google Sheet, and name it
   something like **iSim site tracking**.
2. In the sheet: **Extensions → Apps Script**. Delete the sample code, paste in
   everything from `apps-script.gs` (in this folder), and click **Save**.
3. In the function dropdown at the top, choose **setup** and click **Run**.
   Google asks you to authorise it. Because it's your own script, you'll see
   an "unverified app" warning: click **Advanced → Go to (project name)** and
   allow. This creates the **Summary** and **Events** tabs. (If it fails,
   carry on: the Events tab is created automatically with the first event,
   and you can run setup again later for the Summary tab.)
4. Click **Deploy → New deployment**. Choose type **Web app**, set
   **Execute as: Me** and **Who has access: Anyone**, then **Deploy**.
   Copy the **Web app URL** (it ends in `/exec`).
   Opening that URL in a browser should say "Tracking is running" and name
   the spreadsheet it writes to.
5. In `script.js`, at the very top, paste that URL between the quotes:
   `const TRACK_URL = 'https://script.google.com/macros/s/.../exec';`
   Commit and push. Tracking starts within a minute of the site updating.

## Reading the numbers

Open the **Summary** tab: visits, booking forms, call taps and WhatsApp taps
for the last 7 days and all time, plus call taps broken down by session. The
**Events** tab has every individual event with its time (Cairo time).

## Good to know

- The web app URL is public, so someone could send fake events to it. The
  script only accepts the four known event names and trims long values, but
  numbers could in theory be inflated.
- If you change `apps-script.gs` later, redeploy with **Deploy → Manage
  deployments → Edit → New version**, so the URL stays the same.
