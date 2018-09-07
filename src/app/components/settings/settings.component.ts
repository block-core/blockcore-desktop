import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { Theming } from '../../services/theming.service';
import { AppModes } from '../../shared/app-modes';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SettingsComponent {
    @HostBinding('class.settings') hostClass = true;

    autoLock = true;
    clearOnExit = false;
    selectedTheme: string;
    selectedLanguage: string;
    selectedCurrency: string;
    selectedWalletMode: string;
    selectedMode: string;

    constructor(public readonly theme: Theming, public appModes: AppModes) {
        this.selectedTheme = theme.currentTheme;

        if (localStorage.getItem('Settings:AutoLock') === 'false') {
            this.autoLock = false;
        }

        if (localStorage.getItem('Settings:ClearOnExit') === 'true') {
            this.clearOnExit = true;
        }

        this.selectedWalletMode = localStorage.getItem('Settings:WalletMode') || 'multi';
        this.selectedMode = localStorage.getItem('Settings:Mode') || 'basic';
    }

    onAutoLockChanged(event) {
        console.log(event);
        console.log(this.autoLock);
    }

    onClearOnExitChanged(event) {
        console.log(event);
        console.log(this.clearOnExit);
    }

    onThemeChange(event) {
        this.theme.toggle();
    }

    onChanged(event) {

        this.appModes.activate(this.selectedMode);

        localStorage.setItem('Settings:Mode', this.selectedMode);
        localStorage.setItem('Settings:WalletMode', this.selectedWalletMode);
        localStorage.setItem('Settings:Language', this.selectedLanguage);
        localStorage.setItem('Settings:Currency', this.selectedCurrency);
        localStorage.setItem('Settings:AutoLock', this.autoLock ? 'true' : 'false');
        localStorage.setItem('Settings:ClearOnExit', this.clearOnExit ? 'true' : 'false');
    }
}
