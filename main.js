"use strict";
/* eslint-disable */
exports.__esModule = true;
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
var os = require("os");
var log = require("electron-log");
var electron_updater_1 = require("electron-updater");
var fs = require("fs");
// const log = require('electron-log');
// const { autoUpdater } = require('electron-updater');
// const fs = require('fs');
// const readChunk = require('read-chunk');
require('@electron/remote/main').initialize();
// Set the log level to info. This is only for logging in this Electron main process.
log.transports.file.level = 'info';
var gotTheLock = electron_1.app.requestSingleInstanceLock();
if (!gotTheLock) {
    writeLog('Another instance of node is running. Quitting this instance.');
    electron_1.app.quit();
}
else {
    electron_1.app.on('second-instance', function (event, commandLine, workingDirectory) {
        writeLog('Another instance of node is running. Attempting to show the UI.');
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            // If not visible, ensure we show it.
            if (!mainWindow.isVisible()) {
                mainWindow.show();
            }
            // If minimized, ensure we restore it.
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }
            // Eventually put focus on the window.
            mainWindow.focus();
        }
    });
}
if (os.arch() === 'arm') {
    writeLog('ARM: Disabling hardware acceleration.');
    electron_1.app.disableHardwareAcceleration();
}
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
// We don't want to support auto download.
electron_updater_1.autoUpdater.autoDownload = false;
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;
var daemonState;
var resetMode = false;
var resetArg = null;
var contents = null;
var currentChain;
var settings;
var hasDaemon = false;
var daemons = [];
var args = process.argv.slice(1);
var serve = args.some(function (val) { return val === '--serve'; });
var coin = { identity: 'city', tooltip: 'Blockcore Hub' }; // To simplify third party forks and different UIs for different coins, we'll define this constant that loads different assets.
require('electron-context-menu')({
    showInspectElement: serve
});
process.on('uncaughtException', function (error) {
    writeLog('Uncaught exception happened:');
    writeLog('Error: ' + error);
});
process.on('exit', function (code) {
    return console.log("About to exit with code ".concat(code));
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
    currentChain = arg;
    writeLog(currentChain);
    if (arg.mode === 'manual') {
        daemonState = DaemonState.Started;
        var msg = 'Blockcore Hub was started in development mode. This requires the user to be running the daemon manually.';
        writeLog(msg);
        event.returnValue = msg;
    }
    else {
        startDaemon(currentChain);
        event.returnValue = 'OK';
    }
});
electron_1.ipcMain.on('settings', function (event, arg) {
    // Update the global settings for the Main thread.
    settings = arg;
    electron_1.app.setLoginItemSettings({
        openAtLogin: arg.openAtLogin
    });
});
electron_1.ipcMain.on('check-for-update', function (event, arg) {
    electron_updater_1.autoUpdater.checkForUpdates();
});
electron_1.ipcMain.on('download-update', function (event, arg) {
    electron_updater_1.autoUpdater.downloadUpdate();
});
electron_1.ipcMain.on('install-update', function (event, arg) {
    electron_updater_1.autoUpdater.quitAndInstall();
});
electron_1.ipcMain.on('daemon-started', function (event, arg) {
    daemonState = DaemonState.Started;
});
electron_1.ipcMain.on('daemon-change', function (event, arg) {
    daemonState = DaemonState.Changing;
});
electron_1.ipcMain.on('choose-data-folder', function (event, arg) {
    var paths = electron_1.dialog.showOpenDialogSync(mainWindow, {
        title: 'Choose a data folder',
        properties: ['openDirectory']
    });
    console.log('PATHS:', paths);
    if (paths.length > 0) {
        event.returnValue = paths[0];
        contents.send('choose-data-folder', paths[0]);
    }
    else {
        event.returnValue = null;
        contents.send('choose-data-folder', null);
    }
    // dialog.showOpenDialog(null, options, (filePaths) => {
    //     event.sender.send('open-dialog-paths-selected', filePaths)
    // });
});
electron_1.ipcMain.on('choose-node-path', function (event, arg) {
    var paths = electron_1.dialog.showOpenDialogSync(mainWindow, {
        title: 'Choose a data folder',
        filters: [
            { name: 'Executable', extensions: ['exe'] },
            { name: 'Assembly', extensions: ['dll'] },
            { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile', 'dontAddToRecent']
    });
    console.log('PATHS:', paths);
    if (paths.length > 0) {
        event.returnValue = paths[0];
        contents.send('choose-node-path', paths[0]);
    }
    else {
        event.returnValue = null;
        contents.send('choose-node-path', null);
    }
    // dialog.showOpenDialog(null, options, (filePaths) => {
    //     event.sender.send('open-dialog-paths-selected', filePaths)
    // });
});
// Called when the app needs to reset the blockchain database. It will delete the "blocks", "chain" and "coinview" folders.
electron_1.ipcMain.on('reset-database', function (event, arg) {
    writeLog('reset-database: User want to reset database, first attempting to shutdown the node.');
    // Mark the daemon state to be in reset mode.
    resetMode = true;
    resetArg = arg;
    // Make sure the daemon is shut down first:
    shutdownDaemon(function (success, error) {
        console.log('Shutdown completed, delete of files will be triggered by different event handler.');
    });
    event.returnValue = 'OK';
});
function parseDataFolder(arg) {
    console.log('parseDataFolder: ', arg);
    // If the first argument is empty string, we must add the user data path.
    if (arg[0] === '') {
        // Build the node data folder, the userData includes app of the UI-app, so we must navigate down one folder.
        var nodeDataFolder = path.join(electron_1.app.getPath('userData'), '..', 'Blockcore');
        arg.unshift(nodeDataFolder);
    }
    var dataFolder = path.join.apply(path, arg);
    return dataFolder;
}
electron_1.ipcMain.on('open-data-folder', function (event, arg) {
    var dataFolder = parseDataFolder(arg);
    electron_1.shell.openPath(dataFolder);
    event.returnValue = 'OK';
});
electron_1.ipcMain.on('download-blockchain-package', function (event, arg) {
    console.log('download-blockchain-package');
    var dataFolder = parseDataFolder(arg.path);
    // Get the folder to download zip to:
    var targetFolder = path.dirname(dataFolder);
    // We must have this in a try/catch or crashes will halt the UI.
    try {
        downloadFile(arg.url, targetFolder, function (finished, progress, error) {
            contents.send('download-blockchain-package-finished', finished, progress, error);
            // if (error) {
            //     console.error('Error during downloading: ' + error);
            // }
            // if (finished) {
            //     console.log('FINISHED!!');
            // }
            // else {
            //     console.log('Progress: ' + progress.status);
            // }
        });
    }
    catch (err) {
    }
    event.returnValue = 'OK';
});
electron_1.ipcMain.on('download-blockchain-package-abort', function (event, arg) {
    try {
        blockchainDownloadRequest.abort();
        blockchainDownloadRequest = null;
    }
    catch (err) {
        event.returnValue = err.message;
    }
    contents.send('download-blockchain-package-finished', true, { status: 'Cancelled', progress: 0, size: 0, downloaded: 0 }, 'Cancelled');
    event.returnValue = 'OK';
});
electron_1.ipcMain.on('unpack-blockchain-package', function (event, arg) {
    console.log('CALLED!!!! - unpack-blockchain-package');
    var targetFolder = parseDataFolder(arg.path);
    var sourceFile = arg.source;
    console.log('targetFolder: ' + targetFolder);
    console.log('sourceFile: ' + sourceFile);
    var extract = require('extract-zip');
    extract(sourceFile, { dir: targetFolder }).then(function () {
        console.log('FINISHED UNPACKING!');
        contents.send('unpack-blockchain-package-finished', null);
    })["catch"](function (err) {
        console.error('Failed to unpack: ', err);
        contents.send('unpack-blockchain-package-finished', err);
    });
    event.returnValue = 'OK';
});
electron_1.ipcMain.on('open-dev-tools', function (event, arg) {
    //mainWindow.webContents.openDevTools();
    var devtools = null;
    devtools = new electron_1.BrowserWindow({
        title: 'Dev Tools',
        icon: __dirname + '/app.ico',
        webPreferences: { webSecurity: false, nodeIntegration: true, contextIsolation: false }
    });
    mainWindow.webContents.setDevToolsWebContents(devtools.webContents);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
    event.returnValue = 'OK';
});
// ipcMain.on('get-wallet-seed', (event, arg: string) => {
//     writeLog('get-wallet-seed: Send the encrypted seed and chain code to the UI.');
//     // TODO: Consider doing this async to avoid UI hanging, but to simplify the integration at the moment and
//     // use return value, we rely on sync read.  "readChunk(filePath, startPosition, length)" <- async
//     // Read 300 characters, that should be more than enough to get the encryptedSeed. Consider doing a loop until we find it.
//     const dataBuffer = readChunk.sync(arg, 1, 500);
//     const data = dataBuffer.toString('utf8');
//     const key = '"encryptedSeed":"';
//     const startIndex = data.indexOf(key);
//     const endIndex = data.indexOf('",', startIndex);
//     const seed = data.substring(startIndex + key.length, endIndex);
//     const keyChainCode = '"chainCode":"';
//     const startIndexChainCode = data.indexOf(keyChainCode);
//     const endIndexChainCode = data.indexOf('",', startIndexChainCode);
//     const chainCode = data.substring(startIndexChainCode + keyChainCode.length, endIndexChainCode);
//     // chainCodeDecoded: Buffer.from(chainCode, 'base64')
//     event.returnValue = { encryptedSeed: seed, chainCode };
// });
electron_1.ipcMain.on('update-icon', function (event, arg) {
    if (arg) {
        mainWindow.setOverlayIcon(__dirname + arg.icon, arg.title);
    }
    else {
        mainWindow.setOverlayIcon(null, '');
    }
});
electron_updater_1.autoUpdater.on('checking-for-update', function () {
    if (!serve) {
        contents.send('checking-for-update');
        writeLog('Checking for update...');
    }
});
electron_updater_1.autoUpdater.on('error', function (error) {
    contents.send('update-error', error);
});
electron_updater_1.autoUpdater.on('update-available', function (info) {
    contents.send('update-available', info);
});
electron_updater_1.autoUpdater.on('update-not-available', function (info) {
    contents.send('update-not-available', info);
});
electron_updater_1.autoUpdater.on('update-downloaded', function (info) {
    contents.send('update-downloaded', info);
});
electron_updater_1.autoUpdater.on('download-progress', function (progressObj) {
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
        title: 'Blockcore Hub',
        icon: __dirname + '/app.ico',
        webPreferences: { webSecurity: false, nodeIntegration: true, contextIsolation: false }
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
            electron: require("".concat(__dirname, "/node_modules/electron"))
        });
        writeLog('Creating Window and loading: http://localhost:4200?coin=' + coin.identity);
        mainWindow.loadURL('http://localhost:4200?coin=' + coin.identity);
    }
    else {
        writeLog('Creating Window and loading: ' + path.join(__dirname, 'dist/index.html'));
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'dist/index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }
    if (serve) {
        //mainWindow.webContents.openDevTools();
        var devtools_1 = null;
        electron_1.app.once('ready', function () {
            devtools_1 = new electron_1.BrowserWindow();
            mainWindow.webContents.setDevToolsWebContents(devtools_1.webContents);
            mainWindow.webContents.openDevTools({ mode: 'detach' });
        });
    }
    // Emitted when the window is going to close.
    mainWindow.on('close', function (event) {
        writeLog("close event on mainWindow was triggered. Calling shutdown method. Daemon state is: ".concat(daemonState, "."));
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
    mainWindow.on('minimize', function (event) {
        if (!settings.showInTaskbar) {
            event.preventDefault();
            mainWindow.hide();
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
    writeLog('Blockcore Hub was exited.');
    exitGuard();
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
    // let daemonName;
    // if (chain.identity === 'city') {
    //     daemonName = 'City.Chain';
    // } else if (chain.identity === 'stratis') {
    //     daemonName = 'Stratis.StratisD';
    // } else if (chain.identity === 'bitcoin') {
    //     daemonName = 'Stratis.StratisD';
    // }
    // If path is not specified and Win32, we'll append .exe
    // if (!chain.path && os.platform() === 'win32') {
    //     daemonName += '.exe';
    // } else if (chain.path) {
    //     daemonName += '.dll';
    // }
    // const daemonPath = path.resolve(folderPath, daemonName);
    // If the user has choosen an .exe or .dll manually in startup, we'll use that, if not
    // we'll set the multinode.
    if (folderPath.indexOf('.exe') == -1 && folderPath.indexOf('.dll') == -1) {
        var daemonName = 'Blockcore.MultiNode.dll';
        if (os.platform() === 'win32') {
            daemonName = 'Blockcore.MultiNode.exe';
        }
        folderPath = path.resolve(folderPath, daemonName);
    }
    writeLog('start-daemon: ' + folderPath);
    launchDaemon(folderPath, chain);
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
function exitGuard() {
    console.log('Exit Guard is processing...');
    if (daemons && daemons.length > 0) {
        for (var i = 0; i < daemons.length; i++) {
            try {
                console.log('Killing (' + daemons[i].pid + '): ' + daemons[i].spawnfile);
                daemons[i].kill();
            }
            catch (err) {
                console.log('Failed to kill daemon: ' + err);
                console.log(daemons[i]);
            }
        }
    }
}
function launchDaemon(apiPath, chain) {
    console.log('launchDaemon is called.');
    var daemonProcess;
    // TODO: Consider a future improvement that would ensure we don't loose a reference to an existing spawned process.
    // If launch is called twice, it might spawn two processes and loose the reference to the first one, and the new process will die due to TCP port lock.
    var spawnDaemon = require('child_process').spawn;
    var commandLineArguments = [];
    // if (chain.mode === 'local') {
    //     if (!apiPath || apiPath.length < 3 || !chain.datafolder || chain.datafolder.length < 3) {
    //         contents.send('daemon-error', `CRITICAL: Cannot launch daemon, missing either daemon path or data folder path.`);
    //         daemonState = DaemonState.Failed;
    //         return;
    //     }
    //     // Only append the apiPath as argument if we are in local mode.
    //     commandLineArguments.push(apiPath);
    // }
    if (chain.datafolder) {
        commandLineArguments.push('-datadir=' + chain.datafolder);
    }
    commandLineArguments.push('--chain=' + chain.chain);
    commandLineArguments.push('-port=' + chain.port);
    commandLineArguments.push('-rpcport=' + chain.rpcPort);
    commandLineArguments.push('-dbtype=rocksdb');
    commandLineArguments.push('-apiport=' + chain.apiPort);
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
    if (chain.path.endsWith('.dll')) {
        daemonProcess = spawnDaemon('dotnet', commandLineArguments, {
            detached: true
        });
    }
    else {
        daemonProcess = spawnDaemon(apiPath, commandLineArguments, {
            detached: true
        });
    }
    daemons.push(daemonProcess);
    daemonProcess.stdout.on('data', function (data) {
        writeDebug("Node: ".concat(data));
    });
    /** Exit is triggered when the process exits. */
    daemonProcess.on('exit', function (code, signal) {
        writeLog("Node daemon process exited with code ".concat(code, " and signal ").concat(signal, " when the state was ").concat(daemonState, "."));
        if (resetMode) {
            resetMode = false;
            daemonState = DaemonState.Changing;
            writeLog('Daemon reset was expected, the user is resetting the blockchain database. Proceeding to delete files...');
            var dataFolder = parseDataFolder(resetArg);
            // After shutdown completes, we'll delete the database.
            deleteFolderRecursive(path.join(dataFolder, 'blocks'));
            deleteFolderRecursive(path.join(dataFolder, 'chain'));
            deleteFolderRecursive(path.join(dataFolder, 'coindb'));
            deleteFolderRecursive(path.join(dataFolder, 'common'));
            deleteFolderRecursive(path.join(dataFolder, 'provenheaders'));
            writeLog('All folders deleted at: ' + dataFolder);
            contents.send('daemon-changing');
            return;
        }
        // There are many reasons why the daemon process can exit, we'll show details
        // in those cases we get an unexpected shutdown code and signal.
        if (daemonState === DaemonState.Changing) {
            writeLog('Daemon exit was expected, the user is changing the network mode.');
            contents.send('daemon-changing');
        }
        else if (daemonState === DaemonState.Starting) {
            contents.send('daemon-error', "CRITICAL: Node daemon process exited during startup with code ".concat(code, " and signal ").concat(signal, "."));
        }
        else if (daemonState === DaemonState.Started) {
            contents.send('daemon-error', "Node daemon process exited manually or crashed, with code ".concat(code, " and signal ").concat(signal, "."));
        }
        else {
            // This is a normal shutdown scenario, but we'll show error dialog if the exit code was not 0 (OK).
            if (code !== 0) {
                contents.send('daemon-error', "City Chain daemon shutdown completed, but resulted in exit code ".concat(code, " and signal ").concat(signal, "."));
            }
            else {
                // Check is stopping of daemon has been requested. If so, we'll notify the UI that it has completed the exit.
                contents.send('daemon-exited');
            }
        }
        daemonState = DaemonState.Stopped;
    });
    daemonProcess.on('error', function (code, signal) {
        writeError("Node daemon process failed to start. Code ".concat(code, " and signal ").concat(signal, "."));
    });
}
function shutdownDaemon(callback) {
    if (!hasDaemon) {
        writeLog('Blockcore Hub is in mobile mode, no daemon to shutdown.');
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
    // if (process.platform !== 'darwin') {
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
    // }
}
function createTray() {
    // Put the app in system tray
    var trayIcon;
    if (serve) {
        // During development, we can read the icon directly from src folder.
        trayIcon = electron_1.nativeImage.createFromPath('./app.ico');
    }
    else {
        // This icon is manually included using "extraResources" on electron-builder.json.
        trayIcon = electron_1.nativeImage.createFromPath(path.resolve(__dirname, '../../resources/app.ico'));
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
    if (contents) {
        contents.send('log-debug', msg);
    }
}
function writeLog(msg) {
    log.info(msg);
    if (contents) {
        contents.send('log-info', msg);
    }
}
function writeError(msg) {
    log.error(msg);
    if (contents) {
        contents.send('log-error', msg);
    }
}
function isNumber(value) {
    return !isNaN(Number(value === null || value === void 0 ? void 0 : value.toString()));
}
function assert(result) {
    if (result !== true) {
        throw new Error('The chain configuration is invalid. Unable to continue.');
    }
}
var blockchainDownloadRequest;
function downloadFile(fileUrl, folder, callback) {
    // If download is triggered again, abort the previous and reset.
    if (blockchainDownloadRequest != null) {
        try {
            blockchainDownloadRequest.abort();
            blockchainDownloadRequest = null;
        }
        catch (err) {
            console.error(err);
        }
    }
    var parse = require('url').parse;
    var http = require('https');
    var fs = require('fs');
    var basename = require('path').basename;
    var timeout = 10000;
    var uri = parse(fileUrl);
    var fileName = basename(uri.path);
    var filePath = path.join(folder, fileName);
    //var url = require('url');
    //var http = require('https');
    //var p = url.parse(fileUrl);
    var file = fs.createWriteStream(filePath);
    var timeout_wrapper = function (req) {
        return function () {
            console.log('abort');
            req.abort();
            callback(true, { size: 0, downloaded: 0, progress: 0, status: 'Timeout' }, "File transfer timeout!");
        };
    };
    blockchainDownloadRequest = http.get(fileUrl).on('response', function (res) {
        var len = parseInt(res.headers['content-length'], 10);
        var downloaded = 0;
        res.on('data', function (chunk) {
            file.write(chunk);
            downloaded += chunk.length;
            callback(false, { url: fileUrl, target: filePath, size: len, downloaded: downloaded, progress: (100.0 * downloaded / len).toFixed(2), status: 'Downloading' });
            //process.stdout.write();
            // reset timeout
            clearTimeout(timeoutId);
            timeoutId = setTimeout(fn, timeout);
        }).on('end', function () {
            // clear timeout
            clearTimeout(timeoutId);
            file.end();
            // Reset the download request instance.
            blockchainDownloadRequest = null;
            if (downloaded != len) {
                callback(true, { size: len, downloaded: downloaded, progress: (100.0 * downloaded / len).toFixed(2), url: fileUrl, target: filePath, status: 'Incomplete' });
            }
            else {
                callback(true, { size: len, downloaded: downloaded, progress: (100.0 * downloaded / len).toFixed(2), url: fileUrl, target: filePath, status: 'Done' });
            }
            // console.log(file_name + ' downloaded to: ' + folder);
            // callback(null);
        }).on('error', function (err) {
            // clear timeout
            clearTimeout(timeoutId);
            callback(true, { size: 0, downloaded: downloaded, progress: (100.0 * downloaded / len).toFixed(2), url: fileUrl, target: filePath, status: 'Error' }, err.message);
        });
    });
    // generate timeout handler
    var fn = timeout_wrapper(blockchainDownloadRequest);
    // set initial timeout
    var timeoutId = setTimeout(fn, timeout);
}
