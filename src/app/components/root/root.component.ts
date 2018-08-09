import { Component, ViewEncapsulation, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef, HostBinding } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Breakpoints } from '@angular/cdk/layout';
import { Observable, Subject } from 'rxjs';
import { takeUntil, map, distinctUntilChanged } from 'rxjs/operators';
import { AuthenticationService } from '../../services/authentication.service';
import { ApplicationStateService } from '../../services/application-state.service';
import { TitleService } from '../../services/title.service';
import { ApiService } from '../../services/api.service';
import { GlobalService } from '../../services/global.service';
import { ElectronService } from 'ngx-electron';
import { Router, NavigationEnd } from '@angular/router';
import { delay, retryWhen } from 'rxjs/operators';
import { WalletInfo } from '../../classes/wallet-info';
import { GeneralInfo } from '../../classes/general-info';
import { DetailsService } from '../../services/details.service';
import { UpdateService } from '../../services/update.service';

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

  handset = false;
  title = 'app';
  showFiller = true;
  isActive = false;
  networkStatusTooltip = '';

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
    private iconRegistry: MatIconRegistry, sanitizer: DomSanitizer,
    private electronService: ElectronService,
    private router: Router,
    private updateService: UpdateService,
    public detailsService: DetailsService,
    private apiService: ApiService,
    private readonly cd: ChangeDetectorRef,
    private globalService: GlobalService,
    private readonly breakpointObserver: BreakpointObserver,
  ) {
    iconRegistry.addSvgIcon('stratis-logo', sanitizer.bypassSecurityTrustResourceUrl('assets/stratis/logo.svg'));
    iconRegistry.addSvgIcon('city-logo', sanitizer.bypassSecurityTrustResourceUrl('assets/city/logo.svg'));
    iconRegistry.addSvgIcon('bitcoin-logo', sanitizer.bypassSecurityTrustResourceUrl('assets/bitcoin/logo.svg'));

    console.log('Expanded:', localStorage.getItem('Menu:Expanded'));

    this.loadFiller();
    
    this.isAuthenticated = authService.isAuthenticated();

    if (this.electronService.remote) {
      let applicationVersion = this.electronService.remote.app.getVersion();

      this.appState.version = applicationVersion;
      console.log('Version: ' + applicationVersion);
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
        //this.showMenu = false;
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
        this.startWalletInfoUpdates();
      } else {
        this.stopWalletInfoUpdates();
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
    //this.sidenav.close();
  }

  toggleFiller() {
    this.showFiller = !this.showFiller;

    localStorage.setItem('Menu:Expanded', this.showFiller ? 'true' : 'false');
  }

  openMenu() {
    this.menuOpened = true;
    this.cd.detectChanges();
  }

  ngOnInit() {
    // We'll check for updates in the startup of the app.
    this.checkForUpdates();

    if (this.router.url !== '/load') {
      this.router.navigateByUrl('/load');
    }
  }

  private updateNetworkInfo() {
    // Need to use same name and icon for TEST networks or not, so perhaps figure out the best way to find the identifier? 
    // Perhaps just "indexof" and have a local array definition in the app?
    //const coinUnit = this.globalService.getCoinUnit().toLowerCase();
    let coinUnit = this.globalService.getCoinName().toLowerCase();
    coinUnit = coinUnit.replace('regtest', '');
    coinUnit = coinUnit.replace('test', '');

    this.coinIcon = coinUnit + '-logo';
    this.coinName = this.globalService.getCoinName();
  }

  private stopWalletInfoUpdates() {
    if (this.walletObservable) {
      this.walletObservable.unsubscribe();
    }
  }

  /** Gets the wallet status every 10 seconds, used to update the cloud status icon. */
  private startWalletInfoUpdates() {
    //let walletInfo = new WalletInfo(this.globalService.getWalletName());
    const walletInfo = new WalletInfo(this.globalService.getWalletName());
    this.walletObservable = this.apiService.getGeneralInfoTyped(walletInfo, 10000)
      .subscribe(response => {
        this.generalInfo = response;

        console.log(this.generalInfo);

        // Uncomment to change the UI to simulate downloading state.
        //this.generalInfo.lastBlockSyncedHeight = 50;
        //this.generalInfo.isChainSynced = false;

        // Translate the epoch value to a proper JavaScript date.
        this.generalInfo.creationTime = new Date(response.creationTime * 1000);

        if (this.generalInfo.lastBlockSyncedHeight) {
          this.percentSyncedNumber = ((this.generalInfo.lastBlockSyncedHeight / this.generalInfo.chainTip) * 100);
          if (this.percentSyncedNumber.toFixed(0) === '100' && this.generalInfo.lastBlockSyncedHeight !== this.generalInfo.chainTip) {
            this.percentSyncedNumber = 99;
          }

          this.percentSynced = this.percentSyncedNumber.toFixed(0) + '%';
        }

        this.networkStatusTooltip = 'Connections: ' + this.generalInfo.connectedNodes + '\nBlock Height: ' + this.generalInfo.chainTip + '\nSynced: ' + this.percentSynced;

      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
