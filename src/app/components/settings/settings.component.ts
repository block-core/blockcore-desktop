import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { Theming } from '../../services/theming.service';
import { AppModes } from '../../shared/app-modes';
import { ElectronService } from 'ngx-electron';
import { Debugger } from 'electron';
import { SettingsService } from 'src/app/services/settings.service';

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

    constructor(
        public readonly theme: Theming,
        public electron: ElectronService,
        public settings: SettingsService,
        public appModes: AppModes) {

        this.selectedTheme = theme.currentTheme;
        this.selectedAutoLock = settings.autoLock;
        this.selectedClearOnExit = settings.clearOnExit;
        this.selectedWalletMode = settings.walletMode;
        this.selectedMode = settings.mode;
        this.selectedShowInTaskbar = settings.showInTaskbar;
        this.selectedOpenOnLogin = settings.openOnLogin;

        console.log('settings.openOnLogin:', settings.openOnLogin);
        console.log('this.selectedOpenOnLogin:', this.selectedOpenOnLogin);

    }

    onThemeChange(event) {
        this.theme.toggle();
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

        console.log('selectedOpenOnLogin:', this.selectedOpenOnLogin);

        this.electron.ipcRenderer.send('settings', { openAtLogin: this.settings.openOnLogin, showInTaskbar: this.settings.showInTaskbar });
    }
}
