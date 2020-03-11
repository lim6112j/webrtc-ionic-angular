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
* webrtc test
  1. one tab , run (8100 port)
  ```
  ionic serve
  ```

  2. another tab, run (4200 port)
  ```
  npm run ng serve
  ```
  3. start button on both tabs
  4. send data each other