"use strict";
var _this = this;
exports.__esModule = true;
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
var os = require("os");
var autoUpdater = require('electron-updater').autoUpdater;
// const electron = require('electron');
// const path = require('path');
var fs = require('fs');
// We don't want to support auto download.
autoUpdater.autoDownload = false;
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;
var contents = null;
var args = process.argv.slice(1);
var serve = args.some(function (val) { return val === '--serve' || val === '-serve'; });
var coin = { identity: 'city', tooltip: 'City Hub' }; // To simplify third party forks and different UIs for different coins, we'll define this constant that loads different assets.
var chain;
require('electron-context-menu')({
    showInspectElement: serve
});
electron_1.ipcMain.on('start-daemon', function (event, arg) {
    // The "chain" object is supplied over the IPC channel and we should consider
    // it potentially "hostile", if anyone can inject anything in the app and perform
    // a call to the node backend here. Since we are launching a process here,
    // we should make sure to wash and validate the object properly to make it
    // harder to perform a remote execution exploit through this interface.
    assert(isNumber(arg.port));
    assert(isNumber(arg.rpcPort));
    assert(isNumber(arg.apiPort));
    assert(isNumber(arg.wsPort));
    assert(arg.network.length < 20);
    _this.chain = arg;
    if (serve) {
        var msg = 'City Hub was started in development mode. This requires the user to be running the daemon manually.';
        writeLog(msg);
        event.returnValue = msg;
    }
    else {
        writeLog(_this.chain);
        startDaemon(_this.chain);
        event.returnValue = 'OK';
    }
});
electron_1.ipcMain.on('check-for-update', function (event, arg) {
    autoUpdater.checkForUpdates();
    // event.returnValue = 'OK';
});
electron_1.ipcMain.on('download-update', function (event, arg) {
    autoUpdater.downloadUpdate();
    // event.returnValue = 'OK';
});
electron_1.ipcMain.on('install-update', function (event, arg) {
    autoUpdater.quitAndInstall();
    // setImmediate(() => autoUpdater.quitAndInstall());
    // event.returnValue = 'OK';
});
// Called when the app needs to reset the blockchain database. It will delete the "blocks", "chain" and "coinview" folders.
electron_1.ipcMain.on('reset-database', function (event, arg) {
    // Make sure the daemon is shut down first:
    shutdownDaemon(function () {
        var userDataPath = electron_1.app.getPath('userData');
        var appDataFolder = path.dirname(userDataPath);
        var dataFolder = path.join(appDataFolder, 'CityChain', 'city', arg);
        var folderBlocks = path.join(dataFolder, 'blocks');
        var folderChain = path.join(dataFolder, 'chain');
        var folderCoinView = path.join(dataFolder, 'coinview');
        var folderFinalizedBlock = path.join(dataFolder, 'finalizedBlock');
        // After shutdown completes, we'll delete the database.
        deleteFolderRecursive(folderBlocks);
        deleteFolderRecursive(folderChain);
        deleteFolderRecursive(folderCoinView);
        deleteFolderRecursive(folderFinalizedBlock);
    });
    // autoUpdater.checkForUpdates();
    event.returnValue = 'OK';
});
electron_1.ipcMain.on('open-data-folder', function (event, arg) {
    var userDataPath = electron_1.app.getPath('userData');
    var appDataFolder = path.dirname(userDataPath);
    var dataFolder = path.join(appDataFolder, 'CityChain', 'city', arg);
    electron_1.shell.openItem(dataFolder);
    // autoUpdater.checkForUpdates();
    event.returnValue = 'OK';
});
autoUpdater.on('checking-for-update', function () {
    contents.send('checking-for-update');
    writeLog('Checking for update...');
});
autoUpdater.on('error', function (error) {
    contents.send('update-error', error);
});
autoUpdater.on('update-available', function (info) {
    contents.send('update-available', info);
    // dialog.showMessageBox({
    //     type: 'info',
    //     title: 'Found Updates',
    //     message: 'Found updates, do you want update now?',
    //     buttons: ['Sure', 'No']
    // }, (buttonIndex) => {
    //     if (buttonIndex === 0) {
    //         autoUpdater.downloadUpdate()
    //     }
    //     else {
    //         //updater.enabled = true
    //         //updater = null
    //     }
    // })
});
autoUpdater.on('update-not-available', function (info) {
    contents.send('update-not-available', info);
    // dialog.showMessageBox({
    //     title: 'No Updates',
    //     message: 'Current version is up-to-date.'
    // })
    // updater.enabled = true
    // updater = null
});
autoUpdater.on('update-downloaded', function (info) {
    contents.send('update-downloaded', info);
    // dialog.showMessageBox({
    //     title: 'Install Updates',
    //     message: 'Updates downloaded, application will be quit for update...'
    // }, () => {
    //     setImmediate(() => autoUpdater.quitAndInstall())
    // })
});
autoUpdater.on('download-progress', function (progressObj) {
    contents.send('download-progress', progressObj);
    var log_message = 'Download speed: ' + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')';
    writeLog(log_message);
});
function deleteFolderRecursive(folder) {
    if (fs.existsSync(folder)) {
        fs.readdirSync(folder).forEach(function (file, index) {
            var curPath = folder + '/' + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            }
            else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(folder);
    }
}
function createWindow() {
    // Create the browser window.
    mainWindow = new electron_1.BrowserWindow({
        width: 1150,
        height: 800,
        frame: true,
        minWidth: 260,
        minHeight: 400,
        title: 'City Hub',
        icon: __dirname + '/app.ico'
    });
    contents = mainWindow.webContents;
    mainWindow.setMenu(null);
    // Make sure links that open new window, e.g. target="_blank" launches in external window (browser).
    mainWindow.webContents.on('new-window', function (event, linkUrl) {
        event.preventDefault();
        electron_1.shell.openExternal(linkUrl);
    });
    if (serve) {
        require('electron-reload')(__dirname, {});
        mainWindow.loadURL('http://localhost:4200?coin=' + coin.identity);
    }
    else {
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'dist/index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }
    if (serve) {
        mainWindow.webContents.openDevTools();
    }
    // Emitted when the window is going to close.
    mainWindow.on('close', function () {
    });
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.on('ready', function () {
    createTray();
    createWindow();
    registerAutoUpdater();
});
function registerAutoUpdater() {
    writeLog('REGISTER AUTO UPDATER EVENTS!');
    // autoUpdater.checkForUpdates();
    // autoUpdater.on('update-downloaded', (info) => {
    //     console.log('Update downloaded');
    //     setTimeout(() => {
    //         // TODO: Add UI to inform users that update downloaded and give them option to quit and install.
    //         //autoUpdater.quitAndInstall();
    //     }, 10000);
    // });
    // autoUpdater.checkForUpdatesAndNotify();
}
// app.on('before-quit', () => {
//     shutdownDaemon();
// });
var quit = function () {
    shutdownDaemon(function () { });
    electron_1.app.quit();
};
// Quit when all windows are closed.
electron_1.app.on('window-all-closed', function () {
    quit();
});
electron_1.app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});
function startDaemon(chain) {
    var folderPath = getDaemonPath();
    var daemonName;
    if (chain.identity === 'city') {
        daemonName = 'City.Chain';
    }
    else if (chain.identity === 'stratis') {
        daemonName = 'Stratis.StratisD';
    }
    else if (chain.identity === 'bitcoin') {
        daemonName = 'Stratis.StratisD';
    }
    if (os.platform() === 'win32') {
        daemonName += '.exe';
    }
    var daemonPath = path.resolve(folderPath, daemonName);
    launchDaemon(daemonPath, chain);
}
function getDaemonPath() {
    var apiPath;
    if (os.platform() === 'win32') {
        apiPath = path.resolve(__dirname, '..\\..\\resources\\daemon\\');
    }
    else if (os.platform() === 'linux') {
        apiPath = path.resolve(__dirname, '..//..//resources//daemon//');
    }
    else {
        apiPath = path.resolve(__dirname, '..//..//resources//daemon//');
    }
    return apiPath;
}
function launchDaemon(apiPath, chain) {
    var daemonProcess;
    var spawnDaemon = require('child_process').spawn;
    var commandLineArguments = [];
    commandLineArguments.push('-port=' + chain.port);
    commandLineArguments.push('-rpcport=' + chain.rpcPort);
    commandLineArguments.push('-apiport=' + chain.apiPort);
    commandLineArguments.push('-wsport=' + chain.wsPort);
    if (chain.mode === 'light') {
        commandLineArguments.push('-light');
    }
    if (chain.network.indexOf('regtest') > -1) {
        commandLineArguments.push('-regtest');
    }
    else if (chain.network.indexOf('test') > -1) {
        commandLineArguments.push('-testnet');
    }
    // TODO: Consider adding an advanced option in the setup dialog, to allow a custom datadir folder.
    // if (chain.dataDir != null)
    // commandLineArguments.push("-datadir=" + chain.dataDir);
    writeLog('Starting daemon with parameters: ' + commandLineArguments);
    daemonProcess = spawnDaemon(apiPath, commandLineArguments, {
        detached: false
    });
    daemonProcess.stdout.on('data', function (data) {
        writeLog("City Hub: " + data);
    });
}
function shutdownDaemon(callback) {
    if (!chain) {
        callback();
        return;
    }
    if (process.platform !== 'darwin' && !serve) {
        var http = require('http');
        var options = {
            hostname: 'localhost',
            port: chain.apiPort,
            path: '/api/node/shutdown',
            method: 'POST'
        };
        var req = http.request(options, function (res) {
            callback();
        }).on('error', function (e) {
            callback();
        });
        req.write('');
        req.end();
    }
}
function createTray() {
    // Put the app in system tray
    var trayIcon;
    if (serve) {
        trayIcon = electron_1.nativeImage.createFromPath('./src/assets/' + coin.identity + '/icon-tray.png');
    }
    else {
        trayIcon = electron_1.nativeImage.createFromPath(path.resolve(__dirname, '../../resources/src/assets/' + coin.identity + '/icon-tray.png'));
    }
    var systemTray = new electron_1.Tray(trayIcon);
    var contextMenu = electron_1.Menu.buildFromTemplate([
        {
            label: 'Hide/Show',
            click: function () {
                mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
            }
        },
        {
            label: 'Exit',
            click: function () {
                electron_1.app.quit();
            }
        }
    ]);
    systemTray.setToolTip(coin.tooltip);
    systemTray.setContextMenu(contextMenu);
    systemTray.on('click', function () {
        if (!mainWindow.isVisible()) {
            mainWindow.show();
        }
        if (!mainWindow.isFocused()) {
            mainWindow.focus();
        }
    });
    electron_1.app.on('window-all-closed', function () {
        if (systemTray) {
            systemTray.destroy();
        }
    });
}
function writeLog(msg) {
    console.log(msg);
    // log.info(msg);
}
function isNumber(value) {
    return !isNaN(Number(value.toString()));
}
function assert(result) {
    if (result !== true) {
        throw new Error('The chain configuration is invalid. Unable to continue.');
    }
}
