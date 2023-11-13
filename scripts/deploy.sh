#!/bin/bash

set -ex

DIR=$(pwd) 


echo "deploy to $1 ..."

pip install cookiecutter
cookiecutter --no-input .
cd cookiecutter_remix
npx pnpm install

echo "deploy to cloudflare ..."
npx pnpm run pages:deploy:$1 --project-name cookiecutter-remix
