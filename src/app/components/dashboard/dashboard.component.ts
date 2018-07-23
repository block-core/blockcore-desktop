import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding } from '@angular/core';


export interface PeriodicElement {
    name: string;
    position: number;
    weight: number;
    symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
    { position: 10, name: 'Jul 13, 2018, 1:15:40 AM', weight: 20.1797, symbol: 'Ne' },
    { position: 9, name: 'Jul 13, 2018, 1:15:40 AM', weight: 18.9984, symbol: 'F' },
    { position: 8, name: 'Jul 13, 2018, 1:15:40 AM', weight: 15.9994, symbol: 'O' },
    { position: 7, name: 'Jul 13, 2018, 1:15:40 AM', weight: 14.0067, symbol: 'N' },
    { position: 6, name: 'Jul 13, 2018, 1:15:40 AM', weight: 12.0107, symbol: 'C' },
    { position: 5, name: 'Jul 13, 2018, 1:15:40 AM', weight: 10.811, symbol: 'B' },
    { position: 4, name: 'Jul 13, 2018, 1:15:40 AM', weight: 9.0122, symbol: 'Be' },
    { position: 3, name: 'Jul 13, 2018, 1:15:40 AM', weight: 6.941, symbol: 'Li' },
    { position: 2, name: 'Jul 13, 2018, 1:15:40 AM', weight: 4.0026, symbol: 'He' },
    { position: 1, name: 'Jul 13, 2018, 1:15:40 AM', weight: 1.0079, symbol: 'H' },
];

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
    @HostBinding('class.dashboard') hostClass = true;

    displayedColumns: string[] = ['position', 'name', 'weight'];
    dataSource = ELEMENT_DATA;
}
