import { Location } from '@angular/common';
import { Directive, HostListener } from '@angular/core';

// tslint:disable-next-line:directive-selector
@Directive({ selector: ':not(a)[routerLinkBack]' })
// tslint:disable-next-line:directive-class-suffix
export class RouterLinkBack {

    constructor(private location: Location) { }

    @HostListener('click')
    onClick(): boolean {
        this.location.back();
        return true;
    }
}
