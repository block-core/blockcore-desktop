import { app, BrowserWindow, ipcMain, Menu, nativeImage, screen, Tray, shell, dialog } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as os from 'os';

const { autoUpdater } = require('electron-updater');

interface Chain {
    name: string;
    identity: string;
    tooltip: string;
    port: number;
    rpcPort: number;
    apiPort?: number;
    wsPort?: number;
    network: string;
    mode?: string;
}

// We don't want to support auto download.
autoUpdater.autoDownload = false;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;
let contents = null;

const args = process.argv.slice(1);
const serve = args.some(val => val === '--serve' || val === '-serve');
const coin = { identity: 'city', tooltip: 'City Hub' }; // To simplify third party forks and different UIs for different coins, we'll define this constant that loads different assets.
let chain: Chain;

require('electron-context-menu')({
    showInspectElement: serve
});

ipcMain.on('start-daemon', (event, arg: Chain) => {

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

    this.chain = arg;

    if (serve) {
        const msg = 'City Hub was started in development mode. This requires the user to be running the daemon manually.';
        writeLog(msg);
        event.returnValue = msg;
    } else {
        writeLog(this.chain);
        startDaemon(this.chain);
        event.returnValue = 'OK';
    }
});

ipcMain.on('check-for-update', (event, arg: Chain) => {
    autoUpdater.checkForUpdates();
    // event.returnValue = 'OK';
});

ipcMain.on('download-update', (event, arg: Chain) => {
    autoUpdater.downloadUpdate();
    // event.returnValue = 'OK';
});

ipcMain.on('install-update', (event, arg: Chain) => {
    autoUpdater.quitAndInstall();
    // setImmediate(() => autoUpdater.quitAndInstall());
    // event.returnValue = 'OK';
});

autoUpdater.on('checking-for-update', () => {
    contents.send('checking-for-update');
    writeLog('Checking for update...');
});

autoUpdater.on('error', (error) => {
    contents.send('update-error', error);
});

autoUpdater.on('update-available', (info) => {
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

autoUpdater.on('update-not-available', (info) => {
    contents.send('update-not-available', info);

    // dialog.showMessageBox({
    //     title: 'No Updates',
    //     message: 'Current version is up-to-date.'
    // })

    // updater.enabled = true
    // updater = null
});

autoUpdater.on('update-downloaded', (info) => {
    contents.send('update-downloaded', info);

    // dialog.showMessageBox({
    //     title: 'Install Updates',
    //     message: 'Updates downloaded, application will be quit for update...'
    // }, () => {
    //     setImmediate(() => autoUpdater.quitAndInstall())
    // })
});

autoUpdater.on('download-progress', (progressObj) => {
    contents.send('download-progress', progressObj);

    let log_message = 'Download speed: ' + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')';
    writeLog(log_message);
});

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
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
        shell.openExternal(linkUrl);
    });

    if (serve) {
        require('electron-reload')(__dirname, {});
        mainWindow.loadURL('http://localhost:4200?coin=' + coin.identity);
    } else {
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
    mainWindow.on('close', () => {
    });

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
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

const quit = () => {
    shutdownDaemon();
    app.quit();
};

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    quit();
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

function startDaemon(chain: Chain) {
    const folderPath = getDaemonPath();
    let daemonName;

    if (chain.identity === 'city') {
        daemonName = 'City.Chain';
    } else if (chain.identity === 'stratis') {
        daemonName = 'Stratis.StratisD';
    } else if (chain.identity === 'bitcoin') {
        daemonName = 'Stratis.StratisD';
    }

    if (os.platform() === 'win32') {
        daemonName += '.exe';
    }

    const daemonPath = path.resolve(folderPath, daemonName);

    launchDaemon(daemonPath, chain);
}

function getDaemonPath() {
    let apiPath;
    if (os.platform() === 'win32') {
        apiPath = path.resolve(__dirname, '..\\..\\resources\\daemon\\');
    } else if (os.platform() === 'linux') {
        apiPath = path.resolve(__dirname, '..//..//resources//daemon//');
    } else {
        apiPath = path.resolve(__dirname, '..//..//resources//daemon//');
    }

    return apiPath;
}

function launchDaemon(apiPath: string, chain: Chain) {
    let daemonProcess;
    const spawnDaemon = require('child_process').spawn;

    const commandLineArguments = [];

    commandLineArguments.push('-port=' + chain.port);
    commandLineArguments.push('-rpcport=' + chain.rpcPort);
    commandLineArguments.push('-apiport=' + chain.apiPort);
    commandLineArguments.push('-wsport=' + chain.wsPort);

    if (chain.mode === 'light') {
        commandLineArguments.push('-light');
    }

    if (chain.network !== 'main') {
        commandLineArguments.push('-' + chain.network); // "-testnet" or "-regtest"
    }

    // TODO: Consider adding an advanced option in the setup dialog, to allow a custom datadir folder.
    // if (chain.dataDir != null)
    // commandLineArguments.push("-datadir=" + chain.dataDir);

    writeLog('Starting daemon with parameters: ' + commandLineArguments);

    daemonProcess = spawnDaemon(apiPath, commandLineArguments, {
        detached: false
    });

    daemonProcess.stdout.on('data', (data) => {
        writeLog(`City Hub: ${data}`);
    });
}

function shutdownDaemon() {

    if (!chain) {
        return;
    }

    if (process.platform !== 'darwin' && !serve) {
        const http = require('http');
        const options = {
            hostname: 'localhost',
            port: chain.apiPort,
            path: '/api/node/shutdown',
            method: 'POST'
        };

        const req = http.request(options, (res) => { });
        req.write('');
        req.end();
    }
}

function createTray() {
    // Put the app in system tray
    let trayIcon;
    if (serve) {
        trayIcon = nativeImage.createFromPath('./src/assets/' + coin.identity + '/icon-tray.png');
    } else {
        trayIcon = nativeImage.createFromPath(path.resolve(__dirname, '../../resources/src/assets/' + coin.identity + '/icon-tray.png'));
    }

    const systemTray = new Tray(trayIcon);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Hide/Show',
            click: function () {
                mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
            }
        },
        {
            label: 'Exit',
            click: function () {
                app.quit();
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

    app.on('window-all-closed', function () {
        if (systemTray) {
            systemTray.destroy();
        }
    });
}

function writeLog(msg) {
    console.log(msg);
    // log.info(msg);
}

function isNumber(value: string | number): boolean {
    return !isNaN(Number(value.toString()));
}

function assert(result: boolean) {
    if (result !== true) {
        throw new Error('The chain configuration is invalid. Unable to continue.');
    }
}
