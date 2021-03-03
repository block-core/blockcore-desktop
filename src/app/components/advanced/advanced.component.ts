import { Component, ViewEncapsulation, HostBinding, NgZone } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { Router } from '@angular/router';
import { ApplicationStateService } from '../../services/application-state.service';
import * as signalR from '@aspnet/signalr';
import { ApiService } from '../../services/api.service';
import { Logger } from '../../services/logger.service';
import { ElectronService } from 'ngx-electron';
import { UpdateService } from '../../services/update.service';

export interface ListItem {
    name: string;
    id: string;
}

@Component({
    selector: 'app-advanced',
    templateUrl: './advanced.component.html',
    styleUrls: ['./advanced.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AdvancedComponent {
    @HostBinding('class.load') hostClass = true;

    selectedMode: ListItem;
    selectedNetwork: ListItem;
    loading: boolean;
    hasWallet = false;
    modes: ListItem[] = [];
    networks: ListItem[] = [];
    remember: boolean;
    connection: signalR.HubConnection;
    delayed = false;
    apiSubscription: any;

    constructor(
        private electronService: ElectronService,
        private authService: AuthenticationService,
        private router: Router,
        private zone: NgZone,
        private log: Logger,
        private apiService: ApiService,
        public updateService: UpdateService,
        public appState: ApplicationStateService) {

    }

    resetDatabase() {
        // Send array of path information to be used in path.join to get native full path in the main process.
        const pathInfo = [this.appState.daemon.datafolder, this.appState.activeChain.rootFolderName, this.appState.activeChain.network];
        this.log.info('Reset Blockchain Database...', pathInfo);

        const path = this.electronService.ipcRenderer.sendSync('reset-database', pathInfo);
        this.log.info('Reset completed: ' + path);
    }

    openDataFolder() {
        // Send array of path information to be used in path.join to get native full path in the main process.
        const pathInfo = [this.appState.daemon.datafolder, this.appState.activeChain.rootFolderName, this.appState.activeChain.network];

        this.log.info('Open Data Folder...', pathInfo);
        const path = this.electronService.ipcRenderer.sendSync('open-data-folder', pathInfo);
    }

    checkForUpdate() {
        this.updateService.checkForUpdate();
    }

    initialize() {
    }

    cancel() {
        this.router.navigateByUrl('/');
    }
}
