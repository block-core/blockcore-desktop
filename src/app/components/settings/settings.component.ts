import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { Theming } from '../../services/theming.service';
import { AppModes } from '../../shared/app-modes';
import { ElectronService } from 'ngx-electron';
import { SettingsService } from 'src/app/services/settings.service';
import { JsonHubProtocol } from '@aspnet/signalr';
import { HubService } from 'src/app/services/hub.service';
import { ApplicationStateService } from 'src/app/services/application-state.service';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SettingsComponent {
    @HostBinding('class.settings') hostClass = true;

    selectedAutoLock: boolean;
    selectedClearOnExit: boolean;
    selectedTheme: string;
    selectedLanguage: string;
    selectedCurrency: string;
    selectedWalletMode: string;
    selectedShowInTaskbar: boolean;
    selectedOpenOnLogin: boolean;
    selectedMode: string;

    selectedHub: string;
    hubs: any;
    addressTypes = ['Legacy', 'Segwit'];
    addressType: string;

    constructor(
        public readonly theme: Theming,
        private electronService: ElectronService,
        public electron: ElectronService,
        public settings: SettingsService,
        public appState: ApplicationStateService,
        public hubService: HubService,
        public appModes: AppModes) {

        this.selectedTheme = theme.currentTheme;
        this.selectedAutoLock = settings.autoLock;
        this.selectedClearOnExit = settings.clearOnExit;
        this.selectedWalletMode = settings.walletMode;
        this.selectedMode = settings.mode;
        this.selectedShowInTaskbar = settings.showInTaskbar;
        this.selectedOpenOnLogin = settings.openOnLogin;
        this.selectedHub = settings.hub;
        this.hubs = settings.hubs;

    }

    onThemeChange(event) {
        this.theme.toggle();
    }

    openDevTools() {
        this.electronService.ipcRenderer.sendSync('open-dev-tools');
        // const win = new BrowserWindow();
        // win.webContents.openDevTools();
    }

    onChanged(event) {
        this.appModes.activate(this.selectedMode);

        this.settings.mode = this.selectedMode;
        this.settings.walletMode = this.selectedWalletMode;
        this.settings.language = this.selectedLanguage;
        this.settings.currency = this.selectedCurrency;
        this.settings.showInTaskbar = this.selectedShowInTaskbar;
        this.settings.openOnLogin = this.selectedOpenOnLogin;
        this.settings.autoLock = this.selectedAutoLock;
        this.settings.clearOnExit = this.selectedClearOnExit;
        this.settings.hub = this.selectedHub;

        console.log('selectedOpenOnLogin:', this.selectedOpenOnLogin);

        this.electron.ipcRenderer.send('settings', { openAtLogin: this.settings.openOnLogin, showInTaskbar: this.settings.showInTaskbar });
    }
}
