# NSC Pricer v0 Plan

## Core flow for v0

1. Create RFQ (client, project, title, description).
2. Add RFQ items (description, quantity, unit, optional material code).
3. Run pricing for an RFQ (simple pricing algorithm).
4. Generate an agreement draft based on a selected price run.

## Out of scope for v0

- Authentication and user roles.
- Advanced AI parsing of RFQs.
- Complex dual-origin (China vs Non-China) logic.
- LME-based price adjustment.
- PDF generation and email automation (these will come later, possibly via n8n).

