#!/bin/bash

set -ex

DIR=$(pwd) 


echo "deploy to cloudflare $1 ..."
npx pnpm run test:integration
