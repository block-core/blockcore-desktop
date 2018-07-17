import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding } from '@angular/core';

@Component({
    selector: 'app-wallet',
    templateUrl: './wallet.component.html',
    styleUrls: ['./wallet.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletComponent {
    @HostBinding('class.wallet') hostClass = true;
}
