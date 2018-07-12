import { Component, ViewEncapsulation, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Breakpoints } from '@angular/cdk/layout';
import { Observable, Subject } from 'rxjs';
import { takeUntil, map, distinctUntilChanged } from 'rxjs/operators';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
  //encapsulation: ViewEncapsulation.None,
  //changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RootComponent implements OnInit, OnDestroy {

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
    private readonly authService: AuthenticationService,
    iconRegistry: MatIconRegistry, sanitizer: DomSanitizer,
    private readonly breakpointObserver: BreakpointObserver,
  ) {
    iconRegistry.addSvgIcon('app-logo', sanitizer.bypassSecurityTrustResourceUrl('assets/stratis/logo.svg'));

    breakpointObserver.observe([
      Breakpoints.HandsetPortrait
    ]).subscribe(result => {
      console.log(result);
      if (result.matches) {
        this.handset = true;
      } else {
        this.handset = false;
      }
    });

  }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
