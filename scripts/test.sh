#!/bin/bash

set -ex

function start_db {
    docker-compose up -d
    echo '🟡 - Waiting for database to be ready...'
    scripts/wait-for-it.sh "${DATABASE_URL}" -- echo '🟢 - Database is ready!'
    npx prisma migrate dev --name init
}

pip install cookiecutter
cookiecutter --no-input .
cd cookiecutter_remix
npx pnpm install
npx playwright install --with-deps

export DATABASE_URL="postgres://postgres:postgres@localhost:54323/postgres"

if [ "$1" == "unit" ]; then
    echo "Running unit tests"
    npx pnpm run test:unit
elif [ "$1" == "integration" ]; then
    echo "Running integration tests"
    start_db
    npx pnpm run test:integration
else
    echo "Running e2e tests"
    start_db
    npx pnpm run dev &
    npx pnpm run test:e2e
fi

