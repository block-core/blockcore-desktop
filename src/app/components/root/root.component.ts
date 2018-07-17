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
import { Router } from '@angular/router';
import { delay, retryWhen } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
  encapsulation: ViewEncapsulation.None,
  //changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RootComponent implements OnInit, OnDestroy {

  @HostBinding('class.root') hostClass = true;

  private readonly destroyed$ = new Subject<void>();
  handset = false;
  title = 'app';
  showFiller = false;
  isActive = false;

  // TODO: Change into Observable.
  get userActivated(): boolean {
    return this.authService.authenticated;
  }

  constructor(
    private readonly titleService: TitleService,
    private readonly authService: AuthenticationService,
    public readonly appState: ApplicationStateService,
    private iconRegistry: MatIconRegistry, sanitizer: DomSanitizer,
    private electronService: ElectronService,
    private router: Router,
    private apiService: ApiService,
    private globalService: GlobalService,
    private readonly breakpointObserver: BreakpointObserver,
  ) {
    iconRegistry.addSvgIcon('stratis-logo', sanitizer.bypassSecurityTrustResourceUrl('assets/stratis/logo.svg'));
    iconRegistry.addSvgIcon('city-logo', sanitizer.bypassSecurityTrustResourceUrl('assets/city/logo.svg'));
    iconRegistry.addSvgIcon('bitcoin-logo', sanitizer.bypassSecurityTrustResourceUrl('assets/bitcoin/logo.svg'));

    let applicationVersion = this.electronService.remote.app.getVersion();
    console.log('Version: ' + applicationVersion);

    breakpointObserver.observe([
      Breakpoints.HandsetPortrait
    ]).subscribe(result => {
      console.log(result);
      if (result.matches) {
        appState.handset = true;
        this.handset = true;
      } else {
        appState.handset = false;
        this.handset = false;
      }
    });

  }

  get appTitle$(): Observable<string> {
    return this.titleService.$title;
  }

  ngOnInit() {

    this.apiService.getWalletFiles()
      .pipe(delay(5000))
      .pipe(retryWhen(errors => errors.pipe(delay(2000))))
      .subscribe(() => this.startApp());
  }

  private startApp() {
    console.log('Connected to daemon.');
    this.router.navigateByUrl('/login');
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
