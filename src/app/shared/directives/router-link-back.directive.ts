import { Location } from '@angular/common';
import { Directive, HostListener } from '@angular/core';
import { Router } from '@angular/router';

// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ selector: ':not(a)[routerLinkBack]' })
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class RouterLinkBack {

    constructor(private location: Location, private router: Router) { }

    @HostListener('click')
    onClick(): boolean {
        if (this.location.path().indexOf('/history/block/') === 0) {
            this.router.navigateByUrl('/history');
        } else {
            this.location.back();
        }
        return true;
    }
}
