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
* webrtc test - web to app
  1. run web
  ```
  ionic serve
  ```

  2. run app (ios) - team auth modification needed on xcode as usual
  ```
  ionic cordova emulate ios
  ```

  3. start button on app
  4. start button on web
  5. type send text and click send on both sides