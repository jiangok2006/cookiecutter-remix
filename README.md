![test](https://github.com/jiangok2006/cookiecutter-remix/actions/workflows/main.yml/badge.svg)

# Introduction

This cookiecutter uses: remix, supabase, typescript, prisma, vitest (for *.test.ts), playwright (for ui test *.spec.ts).

# Install

1. install cookiecutter `cookiecutter gh:jiangok2006/cookiecutter-remix`
1. install dependencies `npm install`
1. run remix server `npm run dev` and browse http://localhost:3000.
1. test `npm run test:[unit|int|e2e]`

# Misc

`{{cookiecutter.project_slug}}` disables liveload. Renaming it to a folder without `{}` makes liveload work again. Also, it makes vscode not able to find modules for ts files in the root directory. ALWAYS renaming it (e.g. my) when working on it and restore after test pass.

# References

[cookiecutter](https://cookiecutter.readthedocs.io/en/2.4.0/tutorials/tutorial2.html#step-1-name-your-cookiecutter)

[remix and typescript project](https://coderpad.io/blog/development/how-to-build-a-web-application-with-typescript-and-remix/)
