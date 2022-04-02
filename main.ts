/* eslint-disable */

import { app, BrowserWindow, ipcMain, Menu, nativeImage, screen, Tray, shell, dialog } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as os from 'os';
import * as log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import * as fs from 'fs';

// const log = require('electron-log');
// const { autoUpdater } = require('electron-updater');
// const fs = require('fs');
// const readChunk = require('read-chunk');

require('@electron/remote/main').initialize();

// Set the log level to info. This is only for logging in this Electron main process.
log.transports.file.level = 'info';

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    writeLog('Another instance of node is running. Quitting this instance.');
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
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
    app.disableHardwareAcceleration();
}

enum DaemonState {
    Unknown = 0,
    Starting = 1,
    Started = 2,
    Changing = 3,
    Stopping = 4,
    Stopped = 5,
    Failed = 6
}

interface Chain {
    name: string;
    chain: string;
    identity: string;
    tooltip: string;
    port: number;
    rpcPort: number;
    apiPort?: number;
    network: string;
    mode?: string;
    path: string; // Used to define a custom path to launch dll with dotnet.
    datafolder: string;
}

interface Settings {
    openAtLogin: boolean;
    showInTaskbar: boolean;
}

// We don't want to support auto download.
autoUpdater.autoDownload = false;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;
let daemonState: DaemonState;
let resetMode = false;
let resetArg = null;
let contents = null;
let currentChain: Chain;
let settings: Settings;
let hasDaemon = false;
let daemons = [];

const args = process.argv.slice(1);
const serve = args.some(val => val === '--serve');
const coin = { identity: 'city', tooltip: 'Blockcore Hub' }; // To simplify third party forks and different UIs for different coins, we'll define this constant that loads different assets.

require('electron-context-menu')({
    showInspectElement: serve
});

process.on('uncaughtException', (error) => {
    writeLog('Uncaught exception happened:');
    writeLog('Error: ' + error);
});

process.on('exit', function (code) {
    return console.log(`About to exit with code ${code}`);
});

ipcMain.on('start-daemon', (event, arg: Chain) => {
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
        const msg = 'Blockcore Hub was started in development mode. This requires the user to be running the daemon manually.';
        writeLog(msg);
        event.returnValue = msg;
    } else {
        startDaemon(currentChain);
        event.returnValue = 'OK';
    }
});

ipcMain.on('settings', (event, arg: Settings) => {
    // Update the global settings for the Main thread.
    settings = arg;

    app.setLoginItemSettings({
        openAtLogin: arg.openAtLogin
    });
});

ipcMain.on('check-for-update', (event, arg: Chain) => {
    autoUpdater.checkForUpdates();
});

ipcMain.on('download-update', (event, arg: Chain) => {
    autoUpdater.downloadUpdate();
});

ipcMain.on('install-update', (event, arg: Chain) => {
    autoUpdater.quitAndInstall();
});

ipcMain.on('daemon-started', (event, arg: Chain) => {
    daemonState = DaemonState.Started;
});

ipcMain.on('daemon-change', (event, arg: any) => {
    daemonState = DaemonState.Changing;
});

ipcMain.on('choose-data-folder', (event, arg: Chain) => {

    const paths = dialog.showOpenDialogSync(mainWindow, {
        title: 'Choose a data folder',
        properties: ['openDirectory']
    });

    console.log('PATHS:', paths);

    if (paths.length > 0) {
        event.returnValue = paths[0];
        contents.send('choose-data-folder', paths[0]);
    } else {
        event.returnValue = null;
        contents.send('choose-data-folder', null);
    }

    // dialog.showOpenDialog(null, options, (filePaths) => {
    //     event.sender.send('open-dialog-paths-selected', filePaths)
    // });
});

ipcMain.on('choose-node-path', (event, arg: Chain) => {

    const paths = dialog.showOpenDialogSync(mainWindow, {
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
    } else {
        event.returnValue = null;
        contents.send('choose-node-path', null);
    }

    // dialog.showOpenDialog(null, options, (filePaths) => {
    //     event.sender.send('open-dialog-paths-selected', filePaths)
    // });
});

// Called when the app needs to reset the blockchain database. It will delete the "blocks", "chain" and "coinview" folders.
ipcMain.on('reset-database', (event, arg: any) => {
    writeLog('reset-database: User want to reset database, first attempting to shutdown the node.');

    // Mark the daemon state to be in reset mode.
    resetMode = true;
    resetArg = arg;

    // Make sure the daemon is shut down first:
    shutdownDaemon((success, error) => {
        console.log('Shutdown completed, delete of files will be triggered by different event handler.');
    });

    event.returnValue = 'OK';
});

function parseDataFolder(arg: any) {
    console.log('parseDataFolder: ', arg);

    // If the first argument is empty string, we must add the user data path.
    if (arg[0] === '') {
        // Build the node data folder, the userData includes app of the UI-app, so we must navigate down one folder.
        const nodeDataFolder = path.join(app.getPath('userData'), '..', 'Blockcore');

        arg.unshift(nodeDataFolder);
    }

    const dataFolder = path.join(...arg);

    return dataFolder;
}

ipcMain.on('open-data-folder', (event, arg: any) => {

    const dataFolder = parseDataFolder(arg);

    shell.openPath(dataFolder);

    event.returnValue = 'OK';
});

ipcMain.on('download-blockchain-package', (event, arg: any) => {

    console.log('download-blockchain-package');

    const dataFolder = parseDataFolder(arg.path);

    // Get the folder to download zip to:
    const targetFolder = path.dirname(dataFolder);

    // We must have this in a try/catch or crashes will halt the UI.
    try {
        downloadFile(arg.url, targetFolder, (finished, progress, error) => {

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

ipcMain.on('download-blockchain-package-abort', (event, arg: any) => {
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

ipcMain.on('unpack-blockchain-package', (event, arg: any) => {

    console.log('CALLED!!!! - unpack-blockchain-package');

    let targetFolder = parseDataFolder(arg.path);
    let sourceFile = arg.source;

    console.log('targetFolder: ' + targetFolder);
    console.log('sourceFile: ' + sourceFile);

    const extract = require('extract-zip');
    extract(sourceFile, { dir: targetFolder }).then(() => {
        console.log('FINISHED UNPACKING!');
        contents.send('unpack-blockchain-package-finished', null);
    }).catch(err => {
        console.error('Failed to unpack: ', err);
        contents.send('unpack-blockchain-package-finished', err);
    });

    event.returnValue = 'OK';
});

ipcMain.on('open-dev-tools', (event, arg: string) => {
    //mainWindow.webContents.openDevTools();
    let devtools = null;
    devtools = new BrowserWindow({
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

ipcMain.on('update-icon', (event, arg: { icon, title }) => {
    if (arg) {
        mainWindow.setOverlayIcon(__dirname + arg.icon, arg.title);
    }
    else {
        mainWindow.setOverlayIcon(null, '');
    }
});

autoUpdater.on('checking-for-update', () => {
    if (!serve) {
        contents.send('checking-for-update');
        writeLog('Checking for update...');
    }
});

autoUpdater.on('error', (error) => {
    contents.send('update-error', error);
});

autoUpdater.on('update-available', (info) => {
    contents.send('update-available', info);
});

autoUpdater.on('update-not-available', (info) => {
    contents.send('update-not-available', info);
});

autoUpdater.on('update-downloaded', (info) => {
    contents.send('update-downloaded', info);
});

autoUpdater.on('download-progress', (progressObj) => {
    contents.send('download-progress', progressObj);

    let log_message = 'Download speed: ' + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')';
    writeLog(log_message);
});

function deleteFolderRecursive(folder) {
    if (fs.existsSync(folder)) {
        fs.readdirSync(folder).forEach(function (file, index) {
            const curPath = folder + '/' + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(folder);
    }
}

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
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
        shell.openExternal(linkUrl);
    });

    if (serve) {
        require('electron-reload')(__dirname, {
            electron: require(`${__dirname}/node_modules/electron`)
        });

        writeLog('Creating Window and loading: http://localhost:4200?coin=' + coin.identity);
        mainWindow.loadURL('http://localhost:4200?coin=' + coin.identity);
    } else {
        writeLog('Creating Window and loading: ' + path.join(__dirname, 'dist/index.html'));
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'dist/index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }

    if (serve) {
        //mainWindow.webContents.openDevTools();
        let devtools = null

        app.once('ready', () => {
            devtools = new BrowserWindow();
            mainWindow.webContents.setDevToolsWebContents(devtools.webContents);
            mainWindow.webContents.openDevTools({ mode: 'detach' });
        })
    }

    // Emitted when the window is going to close.
    mainWindow.on('close', (event) => {
        writeLog(`close event on mainWindow was triggered. Calling shutdown method. Daemon state is: ${daemonState}.`);

        // If daemon stopping has not been triggered, it means it likely never started and user clicked Exit on the error dialog. Exit immediately.
        // Additionally if it was never started, it is already stopped.
        if (daemonState === DaemonState.Stopping || daemonState === DaemonState.Stopped) {
            writeLog('Daemon was in stopping mode, so exiting immediately without showing status any longer.');
            return true;
        } else {
            // If shutdown not initated yet, perform it.
            if (daemonState === DaemonState.Started) {
                writeLog('Daemon shutdown initiated... preventing window close, and informing UI that shutdown is in progress.');

                daemonState = DaemonState.Stopping;

                event.preventDefault();

                contents.send('daemon-exiting');

                // Call the shutdown while we show progress window.
                shutdown(() => { });

                return true;
            } else { // Else, allow window to be closed. This allows users to click X twice to immediately close the window.
                writeLog('ELSE in the CLOSE event. Should only happen on double-click on exit button.');
            }
        }
    });

    mainWindow.on('minimize', (event) => {
        if (!settings.showInTaskbar) {
            event.preventDefault();
            mainWindow.hide();
        }
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
});

app.on('before-quit', () => {
    writeLog('Blockcore Hub was exited.');
    exitGuard();
});

const shutdown = (callback) => {
    writeLog('Signal a shutdown to the daemon.');

    shutdownDaemon((success, error) => {
        if (success) {
            writeLog('Shutdown daemon signaling completed. Waiting for exit signal.');
            callback();
        } else {
            writeError('Shutdown daemon signaling failed. Attempting a single retry.');
            writeError(error);
            // Perform another retry, and quit no matter the result.
            shutdownDaemon((ok, err) => {
                if (ok) {
                    writeLog('Shutdown daemon retry signaling completed successfully.');
                } else {
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

const quit = () => {
    app.quit();
};

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
    hasDaemon = true;
    let folderPath = chain.path || getDaemonPath();

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

function launchDaemon(apiPath: string, chain: Chain) {

    console.log('launchDaemon is called.');

    let daemonProcess;

    // TODO: Consider a future improvement that would ensure we don't loose a reference to an existing spawned process.
    // If launch is called twice, it might spawn two processes and loose the reference to the first one, and the new process will die due to TCP port lock.
    const spawnDaemon = require('child_process').spawn;

    const commandLineArguments = [];

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
    } else if (chain.network.indexOf('test') > -1) {
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

    daemonProcess.stdout.on('data', (data) => {
        writeDebug(`Node: ${data}`);
    });

    /** Exit is triggered when the process exits. */
    daemonProcess.on('exit', function (code, signal) {
        writeLog(`Node daemon process exited with code ${code} and signal ${signal} when the state was ${daemonState}.`);

        if (resetMode) {
            resetMode = false;
            daemonState = DaemonState.Changing;
            writeLog('Daemon reset was expected, the user is resetting the blockchain database. Proceeding to delete files...');

            const dataFolder = parseDataFolder(resetArg);

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
        } else if (daemonState === DaemonState.Starting) {
            contents.send('daemon-error', `CRITICAL: Node daemon process exited during startup with code ${code} and signal ${signal}.`);
        } else if (daemonState === DaemonState.Started) {
            contents.send('daemon-error', `Node daemon process exited manually or crashed, with code ${code} and signal ${signal}.`);
        } else {
            // This is a normal shutdown scenario, but we'll show error dialog if the exit code was not 0 (OK).
            if (code !== 0) {
                contents.send('daemon-error', `City Chain daemon shutdown completed, but resulted in exit code ${code} and signal ${signal}.`);
            } else {
                // Check is stopping of daemon has been requested. If so, we'll notify the UI that it has completed the exit.
                contents.send('daemon-exited');
            }
        }

        daemonState = DaemonState.Stopped;
    }
    );

    daemonProcess.on('error', (code, signal) => {
        writeError(`Node daemon process failed to start. Code ${code} and signal ${signal}.`);
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

    const http = require('http');
    const options = {
        hostname: 'localhost',
        port: currentChain.apiPort,
        path: '/api/node/shutdown',
        method: 'POST'
    };

    const req = http.request(options);

    req.on('response', (res) => {
        if (res.statusCode === 200) {
            writeLog('Request to shutdown daemon returned HTTP success code.');
            callback(true, null);
        } else {
            writeError('Request to shutdown daemon returned HTTP failure code: ' + res.statusCode);
            callback(false, res);
        }
    });

    req.on('error', (err) => {
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
    let trayIcon;
    if (serve) {
        // During development, we can read the icon directly from src folder.
        trayIcon = nativeImage.createFromPath('./app.ico');
    } else {
        // This icon is manually included using "extraResources" on electron-builder.json.
        trayIcon = nativeImage.createFromPath(path.resolve(__dirname, '../../resources/app.ico'));
    }

    const systemTray = new Tray(trayIcon);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Hide/Show',
            click: () => {
                mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
            }
        },
        {
            label: 'Exit',
            click: () => {
                mainWindow.close();
            }
        }
    ]);

    systemTray.setToolTip(coin.tooltip);
    systemTray.setContextMenu(contextMenu);

    systemTray.on('click', () => {
        if (!mainWindow.isVisible()) {
            mainWindow.show();
        }

        if (!mainWindow.isFocused()) {
            mainWindow.focus();
        }
    });

    app.on('window-all-closed', () => {
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

function isNumber(value: string | number): boolean {
    return !isNaN(Number(value?.toString()));
}

function assert(result: boolean) {
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
        } catch (err) {
            console.error(err);
        }
    }

    const { parse } = require('url');
    const http = require('https');
    const fs = require('fs');
    const { basename } = require('path');

    var timeout = 10000;

    const uri = parse(fileUrl);
    const fileName = basename(uri.path);
    const filePath = path.join(folder, fileName);

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
