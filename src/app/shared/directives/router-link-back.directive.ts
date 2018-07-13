import { Location } from '@angular/common';
import { Directive, HostListener } from '@angular/core';

@Directive({ selector: ':not(a)[routerLinkBack]' })
export class RouterLinkBack {

  constructor(private location: Location) { }

  @HostListener('click')
  onClick(): boolean {
    this.location.back();
    return true;
  }
}
