set -x -e

pip install pipx
pipx install gh:jiangok2006/cookiecutter-remix
cd cookiecutter-remix
npm install
npm run dev &
