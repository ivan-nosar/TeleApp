# TypeScript + Electron + Webpack + React boilerplate

Use this boilerplate as a template for cross-platform apps wrote with TypeScript using Electron and React frameworks.

## Edit `package.json`

Update `name`, `version`, `license`, `repository`, `build.productName` and `build.appId` properties of `package.json` file by relevant values.

## Setting up

```bash
npm run install # install all packages
```

## Development

In order to build application use `npm run build` command. It will rebuild both `main` and `renderer` modules. Use `build:main` and `build:renderer` commands to rebuild components independent on each other.

Run `npm start` (equivalent of `npm run start`) to launch application. This command will build application before launching (see `prestart` script in `package.json`).

Execute `npm run dev` in order to start developer server. It will watch for any updates in source code, rebuild and relaunch application each time changes would be saved.

TSLint is set to track code style through all the project in real time. Execute `npm run lint` to run explicit linter check and show the list of issues. In addition `npm run lint:fix` to forcibly fix all the issues. Edit `tslint.json` file in order to update linter rules.

## Additional info

This boilerplate was developed based on [this repository](https://github.com/Robinfr/electron-react-typescript)
