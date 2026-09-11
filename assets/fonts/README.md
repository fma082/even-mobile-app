# Brand fonts

Drop the General Sans files here (from https://www.fontshare.com/fonts/general-sans):

- `GeneralSans-Regular.otf` (or `.ttf`)
- `GeneralSans-Medium.otf`
- `GeneralSans-Semibold.otf`

They are discovered automatically (`lib/fonts.ts`) and matched by file name to
`tokens.fontFamily`. Restart Metro with a cleared cache afterwards: `npx expo start -c`.
Any missing weight falls back to the system font.
