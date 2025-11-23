# NSC Pricer

NSC Pricer is an internal tool for NSC Sinergi to handle RFQs and generate price agreements for steel, piping and related materials.

## v0 Scope

The first version focuses on one core flow:

**RFQ → Pricing Run → Agreement Draft**

It should allow us to:
- Store clients, projects, RFQs and RFQ items
- Run a simple pricing calculation for each RFQ
- Generate a draft price agreement that can be reviewed and sent to clients

## Tech Stack (planned)

- Backend: Node.js + TypeScript + Express
- Database: PostgreSQL (Supabase)
- Frontend: React + TypeScript + Vite + Tailwind CSS

Authentication, advanced AI parsing, China vs Non-China logic, and LME-based adjustments will be added in later versions.

