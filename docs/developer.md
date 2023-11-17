# Developer

## Technology Stack

**Frontend**  

- ui: react-bootstrap, classnames
- js framework: [Create React App](https://create-react-app.dev/docs/documentation-intro)
- template: no use

**Backend API**  

- apphub: Gitea API is used to provide service  for the apphub, such as querying, creating repository, and modifying repository files
- cockpit: this is for running command at host machine


## Build and Test

You should install [Websoft9](https://github.com/Websoft9/websoft9) for testing, then build it:

```
git clone https://github.com/Websoft9/plugin-myapps
cd plugin-myapps
yarn build && cp -r ./build/* /usr/share/cockpit/myapps/
```