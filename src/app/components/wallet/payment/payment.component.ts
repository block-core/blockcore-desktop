import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding } from '@angular/core';

@Component({
    selector: 'app-payment',
    templateUrl: './payment.component.html',
    styleUrls: ['./payment.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PaymentComponent {
    @HostBinding('class.payment') hostClass = true;

}
