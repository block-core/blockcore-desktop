# City Hub

The City Hub is the one-stop-app that citizens, merchants and others can get an overview of 
everything related to their data on the City Chain and the Smart City Platform.
It is additionally a full features wallet app that supports multiple cryptocurrencies, 
such as City Coin (CITY), Bitcoin (BTC) and Stratis (STRAT).

Running the City Hub allows you to participate in staking of your City Coins, and help 
support the global network. 

Additionally you can turn on resource sharing for the Smart City Platform. If you enable 
being an Smart City Platform node, you will receive payments for storage, network and 
processing utilization from other users who user who needs premium services on the 
Smart City Platform.

![City Hub screenshot (2018-07-18)](doc/images/2018-07-18.png "City Hub (2018-07-18)")

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.8.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4201/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Icons

Find icons to use here: [Material Icons](https://material.io/tools/icons/?style=outline)

## Register GitHub publish token

Run this PowerShell command:

```ps
 [Environment]::SetEnvironmentVariable("GH_TOKEN","<YOUR_TOKEN_HERE>","User")
```

## Package

To package for various OSes, you should supply the configuration as an additional parameter:

```sh
npm run build:windows -- -c testnet
```

Additionally there are two PowerShell scripts to build Windows packages. These are located in the scripts folder:

```ps
.\build-win-x64-package.ps1
```

## City Chain daemon

To update with the latest City Chain daemon, make sure you update the submodule that links to city-chain:

```sh
git submodule foreach git pull origin master
```

```sh
git submodule update --init --force --remote
```

## Contribution

To learn more about contribution to this repo, please refer to the [documentation](https://github.com/CityChainFoundation/documentation) repo.

# License

MIT @ City Chain Foundation   
MIT @ Stratisplatform   
