import { Component, Input, HostBinding, ChangeDetectionStrategy, ViewEncapsulation, HostListener } from '@angular/core';
import { SetupService } from 'src/app/services/setup.service';

@Component({
    selector: 'app-logo',
    templateUrl: './logo.component.html',
    styleUrls: ['./logo.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class LogoComponent {
    @HostBinding('class.app-logo') hostClass = true;
    @HostBinding('class.app-logo-hover') hoverClass = false;

    public logoIsImage = false;

    constructor(public setup: SetupService)
    {
        this.logoIsImage = setup.logo.indexOf('/') > -1;
    }

    @HostListener('mouseenter')
    onMouseOver() {
        this.hoverClass = true;
    }

    @HostListener('mouseleave')
    onMouseLeave() {
        this.hoverClass = false;
    }

}
