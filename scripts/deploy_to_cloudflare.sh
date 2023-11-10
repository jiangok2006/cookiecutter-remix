#!/bin/bash

set -ex

DIR=$(pwd) 


echo "deploy to cloudflare $1 ..."
npm run pages:deploy
