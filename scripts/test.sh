set -x -e

pip install pipx
pipx cookiecutter gh:jiangok2006/cookiecutter-remix
cd cookiecutter-remix
npm install
npm run dev &
