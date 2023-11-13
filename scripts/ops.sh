#!/bin/bash

ROOT="$HOME/repo/cookiecutter-remix"

alias prisma_migrate="npx prisma migrate"
alias prisma_seed="npx prisma db seed"
alias prisma_generate="npx prisma generate"
alias prisma_reset="npx prisma migrate reset"

function prepare_push {
    mv $ROOT/my $ROOT/{{cookiecutter.project_slug}}
}

