"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
var os = require("os");
if (os.arch() === 'arm') {
    electron_1.app.disableHardwareAcceleration();
}
var autoUpdater = require('electron-updater').autoUpdater;
var fs = require('fs');
var log = require('electron-log');
var DaemonState;
(function (DaemonState) {
    DaemonState[DaemonState["Unknown"] = 0] = "Unknown";
    DaemonState[DaemonState["Starting"] = 1] = "Starting";
    DaemonState[DaemonState["Started"] = 2] = "Started";
    DaemonState[DaemonState["Changing"] = 3] = "Changing";
    DaemonState[DaemonState["Stopping"] = 4] = "Stopping";
    DaemonState[DaemonState["Stopped"] = 5] = "Stopped";
    DaemonState[DaemonState["Failed"] = 6] = "Failed";
})(DaemonState || (DaemonState = {}));
// Set the log level to info. This is only for logging in this Electron main process.
log.transports.file.level = 'info';
// We don't want to support auto download.
autoUpdater.autoDownload = false;
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;
var daemonState;
var contents = null;
var currentChain;
var hasDaemon = false;
var args = process.argv.slice(1);
var serve = args.some(function (val) { return val === '--serve'; });
var coin = { identity: 'city', tooltip: 'City Hub' }; // To simplify third party forks and different UIs for different coins, we'll define this constant that loads different assets.
require('electron-context-menu')({
    showInspectElement: serve
});
electron_1.ipcMain.on('start-daemon', function (event, arg) {
    if (daemonState === DaemonState.Started) {
        writeLog('Main process was instructed to start daemon, but is is already running. Ignoring request.');
        event.returnValue = 'OK';
        return;
    }
    daemonState = DaemonState.Starting;
    console.log(arg);
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
    currentChain = arg;
    writeLog(currentChain);
    if (arg.mode === 'manual') {
        daemonState = DaemonState.Started;
        var msg = 'City Hub was started in development mode. This requires the user to be running the daemon manually.';
        writeLog(msg);
        event.returnValue = msg;
    }
    else {
        startDaemon(currentChain);
        event.returnValue = 'OK';
    }
});
electron_1.ipcMain.on('check-for-update', function (event, arg) {
    autoUpdater.checkForUpdates();
});
electron_1.ipcMain.on('download-update', function (event, arg) {
    autoUpdater.downloadUpdate();
});
electron_1.ipcMain.on('install-update', function (event, arg) {
    autoUpdater.quitAndInstall();
});
process.on('uncaughtException', function (error) {
    writeLog('Uncaught exception happened:');
    writeLog(error);
});
electron_1.ipcMain.on('daemon-started', function (event, arg) {
    daemonState = DaemonState.Started;
});
electron_1.ipcMain.on('daemon-change', function (event, arg) {
    daemonState = DaemonState.Changing;
});
// Called when the app needs to reset the blockchain database. It will delete the "blocks", "chain" and "coinview" folders.
electron_1.ipcMain.on('reset-database', function (event, arg) {
    // Make sure the daemon is shut down first:
    shutdownDaemon(function (success, error) {
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
    event.returnValue = 'OK';
});
electron_1.ipcMain.on('open-data-folder', function (event, arg) {
    var userDataPath = electron_1.app.getPath('userData');
    var appDataFolder = path.dirname(userDataPath);
    var dataFolder = path.join(appDataFolder, 'CityChain', 'city', arg);
    electron_1.shell.openItem(dataFolder);
    event.returnValue = 'OK';
});
autoUpdater.on('checking-for-update', function () {
    if (!serve) {
        contents.send('checking-for-update');
        writeLog('Checking for update...');
    }
});
autoUpdater.on('error', function (error) {
    contents.send('update-error', error);
});
autoUpdater.on('update-available', function (info) {
    contents.send('update-available', info);
});
autoUpdater.on('update-not-available', function (info) {
    contents.send('update-not-available', info);
});
autoUpdater.on('update-downloaded', function (info) {
    contents.send('update-downloaded', info);
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
        webPreferences: { webSecurity: false, nodeIntegration: true },
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
        require('electron-reload')(__dirname, {
            electron: require(__dirname + "/node_modules/electron")
        });
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
    mainWindow.on('close', function (event) {
        writeLog("close event on mainWindow was triggered. Calling shutdown method. Daemon state is: " + daemonState + ".");
        // If daemon stopping has not been triggered, it means it likely never started and user clicked Exit on the error dialog. Exit immediately.
        // Additionally if it was never started, it is already stopped.
        if (daemonState === DaemonState.Stopping || daemonState === DaemonState.Stopped) {
            writeLog('Daemon was in stopping mode, so exiting immediately without showing status any longer.');
            return true;
        }
        else {
            // If shutdown not initated yet, perform it.
            if (daemonState === DaemonState.Started) {
                writeLog('Daemon shutdown initiated... preventing window close, and informing UI that shutdown is in progress.');
                daemonState = DaemonState.Stopping;
                event.preventDefault();
                contents.send('daemon-exiting');
                // Call the shutdown while we show progress window.
                shutdown(function () { });
                return true;
            }
            else { // Else, allow window to be closed. This allows users to click X twice to immediately close the window.
                writeLog('ELSE in the CLOSE event. Should only happen on double-click on exit button.');
            }
        }
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
});
electron_1.app.on('before-quit', function () {
    writeLog('City Hub was exited.');
});
var shutdown = function (callback) {
    writeLog('Signal a shutdown to the daemon.');
    shutdownDaemon(function (success, error) {
        if (success) {
            writeLog('Shutdown daemon signaling completed. Waiting for exit signal.');
            callback();
        }
        else {
            writeError('Shutdown daemon signaling failed. Attempting a single retry.');
            writeError(error);
            // Perform another retry, and quit no matter the result.
            shutdownDaemon(function (ok, err) {
                if (ok) {
                    writeLog('Shutdown daemon retry signaling completed successfully.');
                }
                else {
                    writeError('Shutdown daemon retry signaling failed.');
                    writeError(err);
                }
                // Inform that we are unable to shutdown the daemon.
                contents.send('daemon-exited', { message: 'Unable to communicate with background process.' });
                callback();
            });
        }
    });
};
var quit = function () {
    electron_1.app.quit();
};
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
    hasDaemon = true;
    var folderPath = chain.path || getDaemonPath();
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
    // If path is not specified and Win32, we'll append .exe
    if (!chain.path && os.platform() === 'win32') {
        daemonName += '.exe';
    }
    else if (chain.path) {
        daemonName += ".dll";
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
    // TODO: Consider a future improvement that would ensure we don't loose a reference to an existing spawned process.
    // If launch is called twice, it might spawn two processes and loose the reference to the first one, and the new process will die due to TCP port lock.
    var spawnDaemon = require('child_process').spawn;
    var commandLineArguments = [];
    if (chain.mode === 'local') {
        if (!apiPath || apiPath.length < 3 || !chain.datafolder || chain.datafolder.length < 3) {
            contents.send('daemon-error', "CRITICAL: Cannot launch daemon, missing either daemon path or data folder path.");
            daemonState = DaemonState.Failed;
            return;
        }
        // Only append the apiPath as argument if we are in local mode.
        commandLineArguments.push(apiPath);
    }
    if (chain.datafolder) {
        commandLineArguments.push('-datadir=' + chain.datafolder);
    }
    commandLineArguments.push('-port=' + chain.port);
    commandLineArguments.push('-rpcport=' + chain.rpcPort);
    commandLineArguments.push('-apiport=' + chain.apiPort);
    commandLineArguments.push('-wsport=' + chain.wsPort);
    commandLineArguments.push('-txindex=1'); // Required for History (Block) explorer.
    if (chain.mode === 'light') {
        commandLineArguments.push('-light');
    }
    if (chain.network.indexOf('regtest') > -1) {
        commandLineArguments.push('-regtest');
    }
    else if (chain.network.indexOf('test') > -1) {
        commandLineArguments.push('-testnet');
    }
    writeLog('LAUNCH: ' + apiPath);
    writeLog('ARGS: ' + JSON.stringify(commandLineArguments));
    // TODO: Consider adding an advanced option in the setup dialog, to allow a custom datadir folder.
    // if (chain.dataDir != null)
    // commandLineArguments.push("-datadir=" + chain.dataDir);
    writeLog('Starting daemon with parameters: ' + commandLineArguments);
    if (chain.mode === 'local') {
        daemonProcess = spawnDaemon('dotnet', commandLineArguments, {
            detached: true
        });
    }
    else {
        daemonProcess = spawnDaemon(apiPath, commandLineArguments, {
            detached: true
        });
    }
    daemonProcess.stdout.on('data', function (data) {
        writeDebug("City Chain: " + data);
    });
    /** Exit is triggered when the process exits. */
    daemonProcess.on('exit', function (code, signal) {
        writeLog("City Chain daemon process exited with code " + code + " and signal " + signal + " when the state was " + daemonState + ".");
        // There are many reasons why the daemon process can exit, we'll show details
        // in those cases we get an unexpected shutdown code and signal.
        if (daemonState === DaemonState.Changing) {
            writeLog('Daemon exit was expected, the user is changing the network mode.');
        }
        else if (daemonState === DaemonState.Starting) {
            contents.send('daemon-error', "CRITICAL: City Chain daemon process exited during startup with code " + code + " and signal " + signal + ".");
        }
        else if (daemonState === DaemonState.Started) {
            contents.send('daemon-error', "City Chain daemon process exited manually or crashed, with code " + code + " and signal " + signal + ".");
        }
        else {
            // This is a normal shutdown scenario, but we'll show error dialog if the exit code was not 0 (OK).   
            if (code !== 0) {
                contents.send('daemon-error', "City Chain daemon shutdown completed, but resulted in exit code " + code + " and signal " + signal + ".");
            }
            else {
                // Check is stopping of daemon has been requested. If so, we'll notify the UI that it has completed the exit.
                contents.send('daemon-exited');
            }
        }
        daemonState = DaemonState.Stopped;
    });
    daemonProcess.on('error', function (code, signal) {
        writeError("City Chain daemon process failed to start. Code " + code + " and signal " + signal + ".");
    });
}
function shutdownDaemon(callback) {
    if (!hasDaemon) {
        writeLog('City Hub is in mobile mode, no daemon to shutdown.');
        callback(true, null);
        contents.send('daemon-exited'); // Make the app shutdown.
        return;
    }
    daemonState = DaemonState.Stopping;
    if (!currentChain) {
        writeLog('Chain not selected, nothing to shutdown.');
        callback(true, null);
        return;
    }
    if (process.platform !== 'darwin') {
        writeLog('Sending POST request to shut down daemon.');
        var http = require('http');
        var options = {
            hostname: 'localhost',
            port: currentChain.apiPort,
            path: '/api/node/shutdown',
            method: 'POST'
        };
        var req = http.request(options);
        req.on('response', function (res) {
            if (res.statusCode === 200) {
                writeLog('Request to shutdown daemon returned HTTP success code.');
                callback(true, null);
            }
            else {
                writeError('Request to shutdown daemon returned HTTP failure code: ' + res.statusCode);
                callback(false, res);
            }
        });
        req.on('error', function (err) {
            writeError('Request to shutdown daemon failed.');
            callback(false, err);
        });
        req.setHeader('content-type', 'application/json-patch+json');
        req.write('true');
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
                mainWindow.close();
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
function writeDebug(msg) {
    log.debug(msg);
    contents.send('log-debug', msg);
}
function writeLog(msg) {
    log.info(msg);
    contents.send('log-info', msg);
}
function writeError(msg) {
    log.error(msg);
    contents.send('log-error', msg);
}
function isNumber(value) {
    return !isNaN(Number(value.toString()));
}
function assert(result) {
    if (result !== true) {
        throw new Error('The chain configuration is invalid. Unable to continue.');
    }
}
