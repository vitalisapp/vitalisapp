# Filipino dish accuracy check (Revision #2)

1. Add meal photos here (jpg/png/webp). Several angles per dish help; include look-alikes
   (adobo vs bistek, menudo vs caldereta, sinigang vs tinola vs nilaga).
2. Copy `manifest.example.json` to `manifest.json` and list each photo's real dish.
   `expected` must be a dish name from `backend/src/utils/filipinoDishes.js`.
   Add `"grams"` when you weighed the portion — otherwise the AI's own weight estimate is used.
3. From `backend/`: `npm run eval:filipino` (live AI calls, needs keys in `backend/.env`).

The summary reports dish accuracy (top-1 and "in alternatives"), calories within ±30 % of the
reference, and — most important — wrong dishes that were **not** flagged as uncertain.
Reference values are approximate; verify against the FNRI Philippine Food Composition Table.
