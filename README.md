# Church Outreach Map

Record new people you meet and invite, and pin their homes on a map.

## Run

    npm install
    npm run dev

Open the local URL it prints (use your phone on the same Wi-Fi with `npm run dev -- --host`).

## Notes

- Prototype data is saved in your browser (localStorage), so it stays on one device.
- Addresses are looked up with OpenStreetMap Nominatim. You can always click the map or drag the pin.
- Next step: replace `src/api.js` with Supabase (Postgres, login, row-level security) so the whole team shares one private database.
- This holds people's personal details. Keep the repo free of real data, and require login before sharing it.
