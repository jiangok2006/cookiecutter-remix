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
`{{cookiecutter.project_slug}}` disables liveload. Renaming it to a folder without `{}` makes liveload work again. Also, it makes vscode not able to find modules for ts files in the root directory.

must init jest using `npx ts-jest config:init package.json `. The default jest.config.js does not work due to "This file is being treated as an ES module because it has a '.js' file extension and '/Users/lian.jiangopendoor.com/repo/cookiecutter-remix/cookiecutter.project_slug/package.json' contains "type": "module". To treat it as a CommonJS script, rename it to use the '.cjs' file extension.".

# References

[cookiecutter](https://cookiecutter.readthedocs.io/en/2.4.0/tutorials/tutorial2.html#step-1-name-your-cookiecutter)

[remix and typescript project](https://coderpad.io/blog/development/how-to-build-a-web-application-with-typescript-and-remix/)
