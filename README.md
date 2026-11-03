# QuickCart — repaired bundle

This bundle includes the supplied QuickCart source plus the missing storefront, database compatibility layer, POS page and PWA icons.

## What changed

- **Tenant storefront routing:** `store.html?store=username` resolves only `/users/{username}/...` data. It does not fall back to the shared root product catalogue when that merchant has no products.
- **Custom domains:** the storefront checks `/domains/{domain-with-commas}` and uses the returned owner.
- **Store editor:** `page-editor.html` now has a real `QCLive` API supplied by the storefront. Element changes, theme styles and custom CSS persist under `/users/{username}/settings/store_edits`; the existing page configuration remains under `settings/page_config`.
- **Admin visual refresh:** updated dashboard styling while retaining the existing dashboard functions and panels.
- **Store experience:** React 18 storefront with responsive layout, product search, category filters, sorting, cart drawer and WhatsApp checkout handoff.
- **POS:** basic merchant-scoped product lookup, cart and completed-sale writes to the merchant's `/orders` path.
- **Database compatibility:** added `qc-db.js`, required by the supplied admin, landing, editor and payment pages.
- **PWA:** added the icon files referenced by `manifest.json`.

## Deployment

1. Back up the currently deployed files.
2. Upload **all files in this ZIP together** to the same hosting root. Do not upload only the changed HTML files.
3. Ensure your hosting serves `index.html` for clean routes such as `/store`, `/dashboard`, `/page-editor` and `/pos` (the supplied `index.html` router expects this).
4. Keep the Firebase Realtime Database rules and existing user records intact. Merchant products/settings/orders are expected at `/users/{username}/products`, `/users/{username}/settings`, and `/users/{username}/orders`.
5. Test with a real merchant account and a separate test merchant. Add one product to merchant A, confirm merchant B sees an empty store, then save an editor change and reload the storefront.

## Validation notes

- All inline JavaScript blocks and `qc-db.js` passed `node --check` syntax validation.
- A live browser smoke test could not complete in this execution environment because Chromium navigation to the local test server was blocked by the environment (`ERR_BLOCKED_BY_ADMINISTRATOR`).
- The actual Firebase tenant data, custom-domain records, staff account schema, Paystack flow and production hosting rewrite rules could not be exercised without access to the deployed environment and its live records. Do not treat those production integrations as certified by this ZIP.
- The POS page is a straightforward order-entry implementation, not a replacement for any more advanced POS workflows that may exist in files not included in the supplied upload.

## Important source files not present in the original upload

The original upload did not contain `store.html`, `qc-db.js` or `pos.html`. This bundle supplies working baseline implementations for those missing dependencies. If your deployed project has more advanced versions of those files, compare and merge before overwriting them.
