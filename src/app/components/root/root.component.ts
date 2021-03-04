/* eslint-disable */

import { Component, ViewEncapsulation, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef, HostBinding, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Breakpoints } from '@angular/cdk/layout';
import { Observable, Subject, Subscription } from 'rxjs';
import { AuthenticationService } from '../../services/authentication.service';
import { ApplicationStateService } from '../../services/application-state.service';
import { TitleService } from '../../services/title.service';
import { ApiService } from '../../services/api.service';
import { GlobalService } from '../../services/global.service';
import { ElectronService } from 'ngx-electron';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { GeneralInfo } from '../../classes/general-info';
import { DetailsService } from '../../services/details.service';
import { UpdateService } from '../../services/update.service';
import { Logger } from '../../services/logger.service';
import { WalletService } from '../../services/wallet.service';
import { AppModes } from '../../shared/app-modes';
import { NotificationService } from 'src/app/services/notification.service';
import { retryWhen, delay, tap } from 'rxjs/operators';
import { NodeStatus } from '@models/node-status';
import { ReportComponent } from '../report/report.component';
import { SettingsService } from 'src/app/services/settings.service';
import { IdentityService } from 'src/app/services/identity.service';
import { IdentityContainer } from '@models/identity';
import { StorageService } from 'src/app/services/storage.service';
import { ChainService } from 'src/app/services/chain.service';
import { BootController } from 'src/boot';
// import { slideInAnimation } from 'src/app/app.animations';

@Component({
    selector: 'app-root',
    templateUrl: './root.component.html',
    styleUrls: ['./root.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
    // animations: [
    //     slideInAnimation
    // ]
})
export class RootComponent implements OnInit {

    @HostBinding('class.root') hostClass = true;

    // private readonly destroyed$ = new Subject<void>();
    private walletObservable;
    private ipc: Electron.IpcRenderer;

    handset = false;
    title = 'app';
    showFiller = true;
    isActive = false;

    coinName: string;
    coinIcon: string;

    percentSyncedNumber = 0;
    percentSynced = '0%';
    generalInfo: GeneralInfo;

    isAuthenticated: Observable<boolean>;
    menuMode = 'side';
    menuOpened = true;

    // TODO: Change into Observable.
    // get userActivated(): boolean {
    //   return this.authService.authenticated;
    // }

    constructor(
        private readonly titleService: TitleService,
        private readonly authService: AuthenticationService,
        public appState: ApplicationStateService,
        public appModes: AppModes,
        private electronService: ElectronService,
        private router: Router,
        private log: Logger,
        public updateService: UpdateService,
        public detailsService: DetailsService,
        public identityService: IdentityService,
        public settings: SettingsService,
        private apiService: ApiService,
        private walletService: WalletService,
        public wallet: WalletService,
        private readonly cd: ChangeDetectorRef,
        public dialog: MatDialog,
        private ngZone: NgZone,
        private storage: StorageService,
        public chains: ChainService,
        public notifications: NotificationService,
        public globalService: GlobalService,
        private zone: NgZone,
        private readonly breakpointObserver: BreakpointObserver,
    ) {
        this.log.info('Expanded:', localStorage.getItem('Menu:Expanded'));

        this.loadFiller();

        this.isAuthenticated = authService.isAuthenticated();

        if (this.electronService.ipcRenderer) {
            if (this.electronService.remote) {
                const applicationVersion = this.electronService.remote.app.getVersion();

                this.appState.setVersion(applicationVersion);
                this.log.info('Version: ' + applicationVersion);
            }

            this.ipc = electronService.ipcRenderer;

            this.ipc.on('daemon-exiting', (event, error) => {
                this.log.info('daemon is currently being stopped... please wait...');
                this.appState.shutdownInProgress = true;
                this.cd.detectChanges();

                // If the exit takes a very long time, we want to allow users to forcefully exit Blockcore Hub.
                setTimeout(() => {
                    this.appState.shutdownDelayed = true;
                    this.cd.detectChanges();
                }, 60000);
            });

            this.ipc.on('daemon-exited', (event, error) => {
                this.log.info('daemon is stopped.');
                this.appState.shutdownInProgress = false;
                this.appState.shutdownDelayed = false;

                // Perform a new close event on the window, this time it will close itself.
                window.close();
            });

            this.ipc.on('daemon-changing', (event, error) => {
                this.zone.run(() => {
                    this.log.info('daemon change is requested and shutdown was successful.');
                    this.cd.detectChanges();

                    // Navigate again to hide the loading indicator.
                    // if (!this.appState.isChangingToChain) {
                    this.router.navigate(['/load']);
                    // }

                    this.cd.detectChanges();
                });
            });

            this.ipc.on('daemon-error', (event, error) => {

                this.log.error(error);

                const dialogRef = this.dialog.open(ReportComponent, {
                    data: {
                        title: 'Failed to start node background daemon',
                        error,
                        lines: this.log.lastEntries()
                    }
                });

                dialogRef.afterClosed().subscribe(result => {
                    this.log.info(`Dialog result: ${result}`);
                });
            });

            this.ipc.on('log-debug', (event, msg: any) => {
                this.log.verbose(msg);
            });

            this.ipc.on('log-info', (event, msg: any) => {
                this.log.info(msg);
            });

            this.ipc.on('log-error', (event, msg: any) => {
                this.log.error(msg);
            });
        }

        // Upon initial load, we'll check if we are on mobile or not and show/hide menu.
        const isSmallScreen = breakpointObserver.isMatched(Breakpoints.HandsetPortrait);

        this.menuOpened = !isSmallScreen;

        breakpointObserver.observe([
            Breakpoints.HandsetPortrait
        ]).subscribe(result => {
            if (result.matches) {
                appState.handset = true;
                this.handset = true;
                this.menuMode = 'over';
                this.showFiller = true;
            } else {
                appState.handset = false;
                this.handset = false;
                this.menuOpened = true;
                this.menuMode = 'side';
                this.loadFiller();
            }
        });

        this.authService.isAuthenticated().subscribe(auth => {
            if (auth) {
                this.updateNetworkInfo();
            } else {
            }
        });

        this.router.events.subscribe((evt) => {
            if (!(evt instanceof NavigationEnd)) {
                return;
            }

            const contentContainer = document.querySelector('.app-view-area-main') || window;
            contentContainer.scrollTo(0, 0);
        });
    }

    get identityTooltip(): string {
        if (this.identityService.identity) {
            const name = this.identityService.identity.content.name || this.identityService.identity.content.identifier;
            const alias = this.identityService.identity.content.alias ? ' (@' + this.identityService.identity.content.alias + ')' : '';
            const title = this.identityService.identity.content.title ? '\n' + this.identityService.identity.content.title : '';

            return `${name}${alias}\nID: ${this.identityService.identity.content.identifier}${title}`;
        }

        return '';
    }

    get networkStatusTooltip(): string {
        if (this.walletService.generalInfo) {
            return `Connections: ${this.walletService.generalInfo.connectedNodes}\nBlock Height: ${this.walletService.generalInfo.chainTip}\nSynced: ${this.walletService.percentSynced}`;
        }

        return '';
    }

    /** Whenever we are downloading, show the download icon. */
    get networkShowDownload(): boolean {
        return !this.appState.pageMode && this.walletService.generalInfo && this.walletService.generalInfo.connectedNodes !== 0 && this.walletService.percentSyncedNumber !== 100;
    }

    /** Whenever we are fully synced, show done icon. */
    get networkShowDone(): boolean {
        return !this.appState.pageMode && this.walletService.generalInfo && this.walletService.generalInfo.connectedNodes !== 0 && this.walletService.percentSyncedNumber === 100;
    }

    /** Whenever we have zero connections on the network, show the offline icon. */
    get networkShowOffline(): boolean {
        return !this.appState.pageMode && this.walletService.generalInfo && this.walletService.generalInfo.connectedNodes === 0;
    }

    get appTitle$(): Observable<string> {
        return this.titleService.$title;
    }

    get listTestNetworks(): boolean {
        return this.storage.getValue('Network:ListTestNetworks') === 'true';
    }

    set listTestNetworks(value: boolean) {
        this.storage.setValue('Network:ListTestNetworks', value.toString());
    }

    get filteredAvailableChains() {
        return this.listTestNetworks ?
            this.chains.availableChains :
            this.chains.availableChains.filter(language => !language.test);
    }

    changeWallet(wallet) {
        // Write the "previous wallet" and then logout.
        localStorage.setItem('Network:Wallet', wallet.name);

        this.stopWallet();

        // Triggers the reboot in main.ts
        // this.ngZone.runOutsideAngular(() => BootController.getbootControl().restart());

        this.router.navigateByUrl('/login');
    }

    stopWallet() {
        // TODO: This code is replicated from logout.component.ts, should be refactored into some state management controller.
        this.wallet.stop();

        this.authService.setAnonymous();

        this.apiService.stopStaking()
            .subscribe(
                response => {
                    // if (response.status >= 200 && response.status < 400) {
                    console.log('Staking was stopped.');
                    // }
                },
                error => {
                    this.apiService.handleException(error);
                }
            );
    }

    changeMode(chain) {
        // Update the change to chain to be what user want to change to.
        this.appState.changeToChain = chain;
        this.appState.isChangingToChain = true;

        this.stopWallet();

        // Persist the current mode as PreviousMode.
        localStorage.setItem('Network:ModePrevious', localStorage.getItem('Network:Mode'));
        localStorage.removeItem('Network:Mode');

        this.appState.changingMode = true;
        this.electronService.ipcRenderer.send('daemon-change');

        // Make sure we shut down the existing node when user choose the change mode action.
        this.apiService.shutdownNode().subscribe(response => {
            // The response from shutdown is returned before the node is fully exited, so put a small delay here.
            // setTimeout(() => {
            //     this.router.navigate(['/load']);
            // }, 1500);
        });

        this.electronService.ipcRenderer.send('update-icon', null);

        this.cd.detectChanges();

        // Restart Angular to refresh services, etc.
        // this.ngZone.runOutsideAngular(() => BootController.getbootControl().restart());

        // Navigate and show loading indicator.
        // this.router.navigate(['/load'], { queryParams: { loading: true, changing: true } });
    }

    prepareRoute(outlet: RouterOutlet) {
        return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation;
    }

    loadFiller() {
        if (localStorage.getItem('Menu:Expanded') === 'false') {
            this.showFiller = false;
        } else {
            this.showFiller = true;
        }
    }

    checkForUpdates() {
        this.updateService.checkForUpdate();
    }

    closeDetails(reason: string) {
        this.detailsService.hide();
    }

    toggleFiller() {
        this.showFiller = !this.showFiller;
        localStorage.setItem('Menu:Expanded', this.showFiller ? 'true' : 'false');
    }

    openMenu() {
        this.menuOpened = true;
        this.cd.detectChanges();
    }

    forceExit() {
        window.close();
    }

    selectIdentity(identity: IdentityContainer) {
        this.identityService.identity = identity;
    }

    ngOnInit() {
        // this.tryStart();

        setTimeout(() => {
            // We'll check for updates in the startup of the app.
            this.checkForUpdates();
        }, 12000);

        // Only perform root toe load redirect when not changing the chain.
        if (!this.appState.changeToChain) {
            if (this.router.url !== '/load') {
                this.router.navigateByUrl('/load');
            }
        }
    }

    private updateNetworkInfo() {
        // Need to use same name and icon for TEST networks or not, so perhaps figure out the best way to find the identifier?
        // Perhaps just "indexof" and have a local array definition in the app?
        // const coinUnit = this.globalService.getCoinUnit().toLowerCase();
        let coinUnit = this.globalService.getCoinName().toLowerCase();
        coinUnit = coinUnit.replace('regtest', '');
        coinUnit = coinUnit.replace('test', '');

        this.coinIcon = coinUnit + '-logo';
        this.coinName = this.globalService.getCoinName();

        console.log(this.coinIcon);
    }

    // ngOnDestroy() {
    //     this.destroyed$.next();
    //     this.destroyed$.complete();
    // }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    private subscription: Subscription;

    // eslint-disable-next-line @typescript-eslint/member-ordering
    private statusIntervalSubscription: Subscription;

    // eslint-disable-next-line @typescript-eslint/member-ordering
    private readonly MaxRetryCount = 50;

    // eslint-disable-next-line @typescript-eslint/member-ordering
    private readonly TryDelayMilliseconds = 3000;

    // eslint-disable-next-line @typescript-eslint/member-ordering
    public apiConnected = false;

    // eslint-disable-next-line @typescript-eslint/member-ordering
    loading = true;

    // eslint-disable-next-line @typescript-eslint/member-ordering
    loadingFailed = false;
}
