#!/bin/bash

set -ex

DIR=$(pwd) 


echo "deploy to cloudflare $1 ..."
npx pnpm add -g pnpm
npx pnpm run pages:deploy
