# Tuco Message Queue Dashboard

## Setup

1. Clone the repo
2. Install dependencies: `npm install`
3. Start Redis: `docker-compose up -d`
4. Copy `.env.example` to `.env`
5. Run DB migration: `npm run db:migrate`
6. Start Next.js: `npm run dev`
7. Start Worker (separate terminal): `npm run worker`
8. Open: http://localhost:3000/dashboard

## Test the webhook

curl -X POST http://localhost:3000/api/webhook/incoming \
  -H "Content-Type: application/json" \
  -d '{
    "contact_id": "c_001",
    "contact_name": "John Doe",
    "phone": "+14155551234",
    "message_text": "Hey John, following up!",
    "campaign_id": "camp_001",
    "priority": "high"
  }'