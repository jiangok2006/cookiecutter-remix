#!/bin/bash

set -ex

DIR=$(pwd) 

pip install cookiecutter
cookiecutter --no-input .
cd cookiecutter_remix
npx pnpm install

echo "deploy to cloudflare ..."
npx pnpm run pages:deploy --project-name cookiecutter-remix
