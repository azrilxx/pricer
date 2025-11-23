# NSC Pricer Requirements (v0)

Core flow:
- Create RFQ
- Add RFQ items
- Run pricing
- Generate agreement draft

Backend:
- Node.js + TypeScript + Express
- PostgreSQL via Supabase client
- REST API only

Frontend:
- React + TypeScript + Vite
- TailwindCSS
- Pages: RFQ List, RFQ Create, RFQ Detail, Agreement Draft

Do not include:
- Auth
- n8n integrations
- LME logic
- China vs Non-China rules
- Email triggers
- PDF generation
- AI parsing
