# Developer

## Technology Stack

**Frontend**  

- ui: [react-bootstrap](https://react-bootstrap.github.io/), [mui](https://v4.mui.com)
- js framework: [Create React App](https://create-react-app.dev/docs/documentation-intro)
- template: no use

**Backend API**  

- apphub: this is for manage installed applications
- cockpit: this is for running command at host machine

related classes:

- src/helpers/api_apphub/apiCore_axios.js (connect cockpit)
- src/helpers/api_apphub/appHub.js

## Build and Test

You should install [Websoft9](https://github.com/Websoft9/websoft9) for testing, then build it:

```
git clone https://github.com/Websoft9/plugin-myapps
cd plugin-myapps
# test
yarn start
yarn test
# build
yarn build && cp -r ./build/* /usr/share/cockpit/myapps/
```
