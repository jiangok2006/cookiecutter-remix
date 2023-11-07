# Install

1. install cookiecutter `cookiecutter gh:jiangok2006/cookiecutter-remix`
1. install dependencies `npm install`
1. run remix server `npm run dev` and browse http://localhost:3000.

# Changelog

11/6/2023: setup a
[base remix project](https://remix.run/docs/en/main/start/quickstart)

# Tests

1. ui test `npm run dev`

# Note
`{{cookiecutter.project_slug}}` disables liveload. Renaming it to a folder without `{}` makes liveload work again. Also, it makes vscode not able to find modules for ts files in the root directory. ALWAYS removing `{}` when working on it and restore after test pass.


`*.test.ts` is run by vitest and `*.spec.ts` by playwright.

# References

[cookiecutter](https://cookiecutter.readthedocs.io/en/2.4.0/tutorials/tutorial2.html#step-1-name-your-cookiecutter)

[remix and typescript project](https://coderpad.io/blog/development/how-to-build-a-web-application-with-typescript-and-remix/)
