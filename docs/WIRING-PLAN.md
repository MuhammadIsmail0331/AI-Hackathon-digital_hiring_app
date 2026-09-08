# Wiring plan — post-regionals round 1 (the ONLY remaining work)

State: commit `05e2b83` pushed to `origin/main` — photo/chat/map APIs, components, pages,
schema (`avatarUrl`, `portfolioImages`, `jobImages`, lat/lng), `db push` done, `tsc` clean.

## Checklist — execute in order, no re-auditing
1. `src/app/[locale]/worker/profile/edit/page.tsx`
   - Wire `<PhotoUpload />` (avatar) → POST `/api/user/avatar`
   - Wire `<LocationMap />` GPS picker → save lat/lng on worker profile
2. `src/components/layout/AutoNav.tsx`
   - Add **Chat** nav item (`/chat`) for WORKER + EMPLOYER roles
   - Show avatar thumbnail in the profile button when `avatarUrl` exists
3. i18n: ensure `messages/en.json` + `messages/ur.json` have namespaces used by
   `/chat` and `/worker/media` pages (add missing keys — prevents MISSING_MESSAGE crash)
4. `npx tsc --noEmit` → fix any errors
5. `git add -A` → commit `feat: wire photos, GPS map + chat into app shell` → `git push origin main`
6. `docs/ROADMAP.md` — append changelog line (date = today)

Rules: NO further file reads after the two targets. NO more state checks before editing.
