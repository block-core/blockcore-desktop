City Hub
===============

Your portal into City Chain
----------------------------

[![VSTS build status][1]][2]

[1]: https://citychain.visualstudio.com/city-chain/_apis/build/status/2?branch=master
[2]: https://citychain.visualstudio.com/city-chain/_build/latest?definitionId=2&branch=master

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

![City Hub screenshot (2018-07-18)](doc/images/2018-08-11.png "City Hub (2018-08-11)")

## Installation

You'll find the latest releases on the [releases]([releases]) tab. Make sure you pick the latest release.

### Auto Updates

City Hub have built in support for updates. They are not installed automatically, but you as
a user are in control. On each startup, City Hub will check for a new version. Additionally if
you have been running City Hub for a long time, you can perform a manual update check in the menu.

When an update is available, there will appear an icon on the menu. Click this icon, to see
update information and perform a download and installation.

### Windows (x64)

For Windows, we decided to only support 64-bit installations of Windows. If you are running
a 32-bit installation, please let us know by reporting an issue to survey the market demand.

Simply download the latest win-x64.exe file from the [releases]([releases]) page and run
the installer. You might need to approve installation of unsigned installer. This will only
be required until we have a signed release available.

### Linux (Ubuntu)

For Linux, we decided to use the new AppImage installer format. This is included in a lot of
Linux distributions, including Ubuntu.

Download the latest linux-x86_64.AppImage from the [releases]([releases]) page.

Open a terminal, navigate to the download folder and make the .AppImage an executeable with 
the following command:

```
$ chmod a+x City.Chain*.AppImage
```

Then you can simply run the installer:

```
$ ./City.Chain*.AppImage
```

### Mac (DMG)


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

To update with the latest City Chain daemon, you must edit the build.yml and edit the parameter named "daemon". Make sure you set it
to a public released and tested version of the City Chain daemon.

## Contribution

To learn more about contribution to this repo, please refer to the [documentation](https://github.com/CityChainFoundation/documentation) repo.

## Security

Security is always a very important concern, and City Hub has more built-in features that most normal wallets. More features, 
means more exposure to potential security issues.

It is important that all contributors are well aware of security principles, and especially regarding Electron, 
more details here: [Electron Security](https://electronjs.org/docs/tutorial/security)

# License

MIT @ City Chain Foundation   
MIT @ Stratisplatform   
