City Hub
===============

Your portal into City Chain
----------------------------

[1]: https://github.com/CityChainFoundation/city-hub/workflows/Build/badge.svg
[2]: https://github.com/CityChainFoundation/city-hub/actions
[3]: https://snyk.io/test/github/CityChainFoundation/city-hub/badge.svg?targetFile=package.json
[4]: https://snyk.io/test/github/CityChainFoundation/city-hub?targetFile=package.json

[![Build Status][1]][2] [![Known Vulnerabilities][3]][4]

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

You'll find the latest releases on the [releases](https://github.com/CityChainFoundation/city-hub/releases) tab. Make sure you pick the latest release.

### Auto Updates

City Hub have built in support for updates. They are not installed automatically, but you as
a user are in control. On each startup, City Hub will check for a new version. Additionally if
you have been running City Hub for a long time, you can perform a manual update check in the menu.

When an update is available, there will appear an icon on the menu. Click this icon, to see
update information and perform a download and installation.

### Windows

For Windows, we decided to only support 64-bit installations of Windows. If you are running
a 32-bit installation, please let us know by reporting an issue to survey the market demand.

Simply download the latest win-x64.exe file from the [releases](https://github.com/CityChainFoundation/city-hub/releases) page and run
the installer. You might need to approve installation of unsigned installer. This will only
be required until we have a signed release available.

### Linux

For Linux, we decided to use the new AppImage installer format. This is included in a lot of
Linux distributions, including Ubuntu.

Download the latest linux-x86_64.AppImage from the [releases](https://github.com/CityChainFoundation/city-hub/releases) page.

Open a terminal, navigate to the download folder and make the .AppImage an executeable with 
the following command:

```
$ chmod a+x City.*.AppImage
```

Then you can simply run the installer:

```
$ ./City.*.AppImage
```

### Mac


## Mobile (Android/iOS)

Support for running City Hub on mobile devices is currently under development. To build and run the mobile version, you need to do the following.


### Development environment

Make sure you have Node.JS install, and open a console promt and navigate to the root of the repo.

```sh
# Install the packages if you have not yet.
npm install
```

### Install tooling
```sh
# Run the script that will install tooling and add platforms. It installs Cordova globally, and add support for android, ios and browser.
npm run mobile-setup
```

### Build to mobile

Normally the "npm start" will build to the dist folder and launch Electron on the desktop. For mobile running, we do currently not have an auto-reload 
development setup. It's a manual build and run.

```sh
# This will build the Angular code and output to the mobile/www folder.
npm run mobile-build

# This will launch the web browser, or you can use "mobile-android" or "mobile-ios".
npm run mobile-browser
```


## Contribution

If you're interested in being a contributor and want to get involved in development of City Chain and City Hub, get started by reading these:

* [City Chain: Documentation](https://github.com/CityChainFoundation/documentation)
* [City Hub: Development](DEVELOPMENT.md)

# License

MIT @ City Chain Foundation   
MIT @ Stratisplatform   
