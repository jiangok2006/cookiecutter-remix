set -x -e

pip install cookiecutter
ls -al
cookiecutter --no-input .
cd cookiecutter_remix
echo "listing files..."
ls -al
npm install
npm run dev &
# npx playwright install --with-deps
npx playwright test
