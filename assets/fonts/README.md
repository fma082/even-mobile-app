# Brand fonts

Which faces are required is DERIVED from the type tokens (`fontAssets` in
`theme/tokens.generated.ts`), so this list updates itself when the Figma export changes.
Files are matched by name; a missing one falls back to the system font at the same weight
and logs a note at startup — it never crashes.

Currently required:

| File | Family | Weight | Status |
| --- | --- | --- | --- |
| `Fraunces-Regular.ttf` | Fraunces | 400 | ✅ committed (Google Fonts, OFL) |
| `GeneralSans-Regular.otf` | General Sans | 400 | ⬜ you must add |
| `GeneralSans-Medium.otf` | General Sans | 500 | ⬜ you must add |
| `GeneralSans-Semibold.otf` | General Sans | 600 | ⬜ you must add |

General Sans is free but not redistributable via a CDN — download it from
https://www.fontshare.com/fonts/general-sans and drop the three files here (`.otf` or `.ttf`,
either works).

Metro resolves `require.context` at bundle time, so restart with a cleared cache afterwards:

```sh
npx expo start -c
```
