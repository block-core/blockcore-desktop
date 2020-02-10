import { Component, ViewEncapsulation, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef, HostBinding } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Breakpoints } from '@angular/cdk/layout';
import { Observable, Subject, Subscription } from 'rxjs';
import { AuthenticationService } from '../../services/authentication.service';
import { ApplicationStateService } from '../../services/application-state.service';
import { TitleService } from '../../services/title.service';
import { ApiService } from '../../services/api.service';
import { GlobalService } from '../../services/global.service';
import { ElectronService } from 'ngx-electron';
import { Router, NavigationEnd } from '@angular/router';
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

@Component({
    selector: 'app-root',
    templateUrl: './root.component.html',
    styleUrls: ['./root.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class RootComponent implements OnInit, OnDestroy {

    @HostBinding('class.root') hostClass = true;

    private readonly destroyed$ = new Subject<void>();
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
        private iconRegistry: MatIconRegistry, sanitizer: DomSanitizer,
        private electronService: ElectronService,
        private router: Router,
        private log: Logger,
        public updateService: UpdateService,
        public detailsService: DetailsService,
        private apiService: ApiService,
        private walletService: WalletService,
        private readonly cd: ChangeDetectorRef,
        public dialog: MatDialog,
        public notifications: NotificationService,
        private globalService: GlobalService,
        private readonly breakpointObserver: BreakpointObserver,
    ) {
        iconRegistry.addSvgIcon('stratis-logo', sanitizer.bypassSecurityTrustResourceUrl('assets/stratis/logo.svg'));
        iconRegistry.addSvgIcon('city-logo', sanitizer.bypassSecurityTrustResourceUrl('assets/city/logo.svg'));
        iconRegistry.addSvgIcon('bitcoin-logo', sanitizer.bypassSecurityTrustResourceUrl('assets/bitcoin/logo.svg'));

        this.log.info('Expanded:', localStorage.getItem('Menu:Expanded'));

        this.loadFiller();

        this.isAuthenticated = authService.isAuthenticated();

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

            // If the exit takes a very long time, we want to allow users to forcefully exit City Hub.
            setTimeout(() => {
                this.appState.shutdownDelayed = true;
                this.cd.detectChanges();
            }, 4000);

        });

        this.ipc.on('daemon-exited', (event, error) => {
            this.log.info('daemon is stopped.');
            this.appState.shutdownInProgress = false;
            this.appState.shutdownDelayed = false;

            // Perform a new close event on the window, this time it will close itself.
            window.close();
        });

        this.ipc.on('daemon-error', (event, error) => {

            this.log.error(error);

            const dialogRef = this.dialog.open(ReportComponent, {
                data: {
                    title: 'Failed to start City Chain background daemon',
                    error,
                    lines: this.log.lastEntries()
             } });

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

    get networkStatusTooltip(): string {
        if (this.walletService.generalInfo) {
            return `Connections: ${this.walletService.generalInfo.connectedNodes}\nBlock Height: ${this.walletService.generalInfo.chainTip}\nSynced: ${this.walletService.percentSynced}`;
        }
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

    ngOnInit() {

        // this.tryStart();

        setTimeout(() => {
            // We'll check for updates in the startup of the app.
            this.checkForUpdates();
        }, 12000);

        if (this.router.url !== '/load') {
            this.router.navigateByUrl('/load');
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
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    // tslint:disable-next-line:member-ordering
    private subscription: Subscription;

    // tslint:disable-next-line:member-ordering
    private statusIntervalSubscription: Subscription;

    // tslint:disable-next-line:member-ordering
    private readonly MaxRetryCount = 50;

    // tslint:disable-next-line:member-ordering
    private readonly TryDelayMilliseconds = 3000;

    // tslint:disable-next-line:member-ordering
    public apiConnected = false;

    // tslint:disable-next-line:member-ordering
    loading = true;

    // tslint:disable-next-line:member-ordering
    loadingFailed = false;
}
