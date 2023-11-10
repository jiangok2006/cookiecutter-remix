#!/bin/bash

set -ex

DIR=$(pwd) 


echo "deploy to cloudflare $1 ..."
pnpm add -g pnpm
npx pnpm run pages:deploy
