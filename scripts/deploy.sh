#!/bin/bash

set -ex

DIR=$(pwd) 


echo "deploy to $1 ..."

pip install cookiecutter
cookiecutter --no-input .
cd cookiecutter_remix
npx pnpm install

echo "deploy to supabase ..."
npx prisma migrate deploy

echo "deploy to cloudflare ..."
npx pnpm run pages:deploy --project-name cookiecutter-remix
