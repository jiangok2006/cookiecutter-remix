#!/bin/bash

set -ex

DIR=$(pwd) 


echo "deploy to cloudflare $1 ..."

pip install cookiecutter
cookiecutter --no-input .
cd cookiecutter_remix
npx pnpm install

npx pnpm run pages:deploy --project-name cookiecutter-remix
