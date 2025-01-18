#!/usr/bin/env sh

# Abort on errors
set -e

# Build
npm run build

# Navigate into the build output directory
cd dist

# Place .nojekyll to bypass Jekyll processing
echo > .nojekyll

# If you are deploying to a custom domain
echo 'sundartech.com' > CNAME

# Initialize a new Git repository
git init
git checkout -B main
git add -A
git commit -m 'deploy'

# If you are deploying to https://sundar1236.github.io
# Uncomment and replace <USERNAME> with your GitHub username
# git push -f git@github.com:sundar1236/sundar1236.github.io.git main

# If you are deploying to https://sundar1236.github.io/test
# Uncomment and replace <USERNAME> and <REPO> with your GitHub username and repository name
git push -f git@github.com:sundar1236/test.git main:gh-pages

# Navigate back to the initial directory
cd -
