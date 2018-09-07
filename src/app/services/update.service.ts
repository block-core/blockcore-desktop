import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { UpdateInfo } from '../components/update/update-info';

@Injectable({
    providedIn: 'root'
})
export class UpdateService {

    static singletonInstance: UpdateService;
    private ipc: Electron.IpcRenderer;
    public info: UpdateInfo;
    public progress: any;
    public downloaded = false;
    public available = false;
    public downloading = false;

    constructor(private electronService: ElectronService) {

        this.ipc = electronService.ipcRenderer;

        if (!UpdateService.singletonInstance) {

            this.ipc.on('check-for-update', (event, info: UpdateInfo) => {
                console.log('check-for-update: ', info);
            });

            this.ipc.on('update-available', (event, info: UpdateInfo) => {
                console.log('update-available: ', info);
                this.info = info;
                this.available = true;
            });

            this.ipc.on('update-not-available', (event, info: UpdateInfo) => {
                console.log('update-not-available: ', info);
                this.info = info;
                this.available = false;
            });

            this.ipc.on('update-downloaded', (event, info: UpdateInfo) => {
                console.log('update-downloaded: ', info);
                this.downloaded = true;
            });

            this.ipc.on('download-progress', (event, progress) => {
                console.log('download-progress: ', progress);
                for (const key in progress) {
                    if (key !== 'percent') {
                        progress[key] = this.bytesToSize(progress[key], (key === 'bytesPerSecond') ? 0 : 1);
                    }
                }
                this.progress = progress;
            });

            this.ipc.on('update-error', (event, error) => {
                console.log('update-error: ', error);
            });

            UpdateService.singletonInstance = this;
        }

        return UpdateService.singletonInstance;
    }

    bytesToSize(bytes: number = 0, precision: number = 1): string {
        const units = ['bytes', 'KB', 'MB', 'GB'];
        if (isNaN(parseFloat(String(bytes))) || !isFinite(bytes)) { return '?'; }

        let unit = 0;

        while (bytes >= 1024) {
            bytes /= 1024;
            unit++;
        }

        return bytes.toFixed(+precision) + ' ' + units[unit];
    }

    checkForUpdate() {
        if (this.ipc) {
            this.electronService.ipcRenderer.send('check-for-update');
        }
    }

    downloadUpdate() {
        if (this.ipc) {
            this.downloading = true;
            this.electronService.ipcRenderer.send('download-update');
        }
    }

    installUpdate() {
        if (this.ipc) {
            this.downloading = false;
            this.electronService.ipcRenderer.send('install-update');
        }
    }
}
