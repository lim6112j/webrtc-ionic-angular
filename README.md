# how to run
* npm install
* run web version
  1. npm start
* run desktop version
  1. npm run build --prod
  1. npx cap copy
  1. npx cap open electron
  1. if error, delete ./electron directory and run 'npx cap add electron' and run from 1.
  1. if error, base directory modify in electron/app/index.html ( '/' => './') 