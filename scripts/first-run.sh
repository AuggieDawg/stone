#!/usr/bin/env bash
set -euo pipefail

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

npm install
npx prisma generate
npx prisma migrate dev

echo "Setup complete. Run: npm run dev"
