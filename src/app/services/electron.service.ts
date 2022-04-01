import { Injectable } from '@angular/core';
import { ipcRenderer, webFrame } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';

@Injectable({
    providedIn: 'root'
})
export class ElectronService {
    fs: typeof fs;
    webFrame: typeof webFrame;
    ipcRenderer: typeof ipcRenderer;
    childProcess: typeof childProcess;
    shell: typeof Electron.shell;

    constructor() {
        if (this.isElectron) {
            // const { BrowserWindow } = require('electron').remote
            this.ipcRenderer = window.require('electron').ipcRenderer;
            this.webFrame = window.require('electron').webFrame;
            this.shell = window.require('electron').shell;
            this.childProcess = window.require('child_process');
            this.fs = window.require('fs');
        }
    }

    get isElectron(): boolean {
        return !!(window && window.process && window.process.type);
    }
}

