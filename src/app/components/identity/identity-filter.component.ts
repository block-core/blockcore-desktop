import { Component, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-identity-filter',
    templateUrl: './identity-filter.component.html'
})
export class IdentityFilterComponent {
    public searchCtrl: FormControl = new FormControl();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    @Output()
    public search: Observable<string> = this.searchCtrl.valueChanges;
}
