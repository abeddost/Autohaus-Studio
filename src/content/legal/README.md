# Legal texts

Place the **approved** legal documents here as Markdown. They are rendered on the legal routes:

| File | Route |
| --- | --- |
| `impressum.de.md` | `/impressum` |
| `datenschutz.de.md` | `/datenschutz` |
| `impressum.en.md` | `/en/legal-notice` |
| `datenschutz.en.md` | `/en/privacy` |

No placeholder legal text is generated. Until a file exists, the route shows
"Dieses Dokument wird derzeit vorbereitet." and `pnpm check:launch` reports it as missing.

The privacy policy should cover at least the enquiry form (stored data, purpose,
retention), the hosting provider, the database provider and the transactional
email provider configured in `.env`. Have the texts reviewed by a legal adviser.
