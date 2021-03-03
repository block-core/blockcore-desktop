/* eslint-disable */

import { Injectable, ChangeDetectorRef } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { UpdateInfo } from '../components/update/update-info';
import { ApplicationStateService } from './application-state.service';
import { NotificationService } from './notification.service';

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

    constructor(
        private electronService: ElectronService,
        private notificationService: NotificationService,
        private appState: ApplicationStateService) {

        if (electronService.ipcRenderer) {
            this.ipc = electronService.ipcRenderer;

            if (!UpdateService.singletonInstance) {

                this.ipc.on('check-for-update', (event, info: UpdateInfo) => {
                    // notificationService.show({ title: 'Checking for update...', body: JSON.stringify(info) });
                    console.log('check-for-update: ', info);
                });

                this.ipc.on('update-available', (event, info: UpdateInfo) => {
                    // notificationService.show({ title: 'Update available!', body: JSON.stringify(info)});
                    console.log('update-available: ', info);
                    this.info = info;
                    this.available = true;
                });

                this.ipc.on('update-not-available', (event, info: UpdateInfo) => {
                    // notificationService.show({ title: 'Update not available', body: JSON.stringify(info) });
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
                    this.progress = progress;
                });

                this.ipc.on('update-error', (event, error) => {
                    // notificationService.show({ title: 'Update error', body: error.message });
                    console.log('update-error: ', error);
                });

                UpdateService.singletonInstance = this;
            }
        }

        return UpdateService.singletonInstance;
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
