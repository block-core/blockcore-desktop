import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ElectronService } from 'ngx-electron';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    constructor(private electron: ElectronService) {

    }

    /** The UI mode of the application. Defaults to basic for most users. */
    get mode(): string {
        return localStorage.getItem('Settings:Mode') || 'basic';
    }

    set mode(value: string) {
        localStorage.setItem('Settings:Mode', value);
    }

    /** Set different wallet modes, the default is multi. Single address mode is not adviceable and can have unexpected effects. */
    get walletMode(): string {
        return localStorage.getItem('Settings:WalletMode') || 'multi';
    }

    set walletMode(value: string) {
        localStorage.setItem('Settings:WalletMode', value);
    }

    get language(): string {
        return localStorage.getItem('Settings:Language');
    }

    set language(value: string) {
        localStorage.setItem('Settings:Language', value);
    }

    get currency(): string {
        return localStorage.getItem('Settings:Currency');
    }

    set currency(value: string) {
        localStorage.setItem('Settings:Currency', value);
    }

    get showInTaskbar(): boolean {
        if (localStorage.getItem('Settings:ShowInTaskbar') === null) {
            return true;
        }

        return localStorage.getItem('Settings:ShowInTaskbar') === 'true';
    }

    set showInTaskbar(value: boolean) {
        localStorage.setItem('Settings:ShowInTaskbar', value.toString());
    }

    get openOnLogin(): boolean {
        return localStorage.getItem('Settings:OpenOnLogin') === 'true';
    }

    set openOnLogin(value: boolean) {
        localStorage.setItem('Settings:OpenOnLogin', value.toString());
    }

    /** NOT IMPLEMENTED. Used to automatically lock the wallet after a certain time. */
    get autoLock(): boolean {
        return localStorage.getItem('Settings:AutoLock') === 'true';
    }

    set autoLock(value: boolean) {
        localStorage.setItem('Settings:AutoLock', value.toString());
    }

    /** NOT IMPLEMENTED. Used to automatically clear the wallet, not persist it on exit. */
    get clearOnExit(): boolean {
        return localStorage.getItem('Settings:ClearOnExit') === 'true';
    }

    set clearOnExit(value: boolean) {
        localStorage.setItem('Settings:ClearOnExit', value.toString());
    }
}
