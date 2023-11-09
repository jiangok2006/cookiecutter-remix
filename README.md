![unit test](https://github.com/jiangok2006/cookiecutter-remix/actions/workflows/main_unit_test.yml/badge.svg)
![integration test](https://github.com/jiangok2006/cookiecutter-remix/actions/workflows/main_integration_test.yml/badge.svg)
![e2e test](https://github.com/jiangok2006/cookiecutter-remix/actions/workflows/main_e2e_test.yml/badge.svg)

# Introduction

This cookiecutter is to address setup pain points with opinionated tooling choices:

* use remix for unified front/backend development.
* favor typescript over js
* favor vitest over jest
* use github action for ci
* use playwright for e2e test
* use supabase for seamless local to cloude development transition.

# Install

1. install cookiecutter `cookiecutter gh:jiangok2006/cookiecutter-remix`
1. install dependencies `npx pnpm install`
1. run remix server `npx pnpm run dev` and browse http://localhost:3000.
1. test `npx pnpm run test:[unit|integration|e2e]`

Note:

`{{cookiecutter.project_slug}}` disables liveload. Renaming it to a folder
without `{}` makes liveload work again. Also, it makes vscode not able to find
modules for ts files in the root directory. ALWAYS renaming it (e.g. my) when
working on it and restore after test pass.

# References

[cookiecutter](https://cookiecutter.readthedocs.io/en/2.4.0/tutorials/tutorial2.html#step-1-name-your-cookiecutter)

[remix and typescript project](https://coderpad.io/blog/development/how-to-build-a-web-application-with-typescript-and-remix/)

[prisma integration test](https://www.prisma.io/blog/testing-series-3-aBUyF8nxAn)
