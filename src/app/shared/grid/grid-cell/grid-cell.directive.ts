import { Directive, ElementRef } from '@angular/core';

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[app-grid-cell]'
})
export class GridCellDirective {
    constructor(private el: ElementRef) {
        const columns: number = el.nativeElement.getAttribute('gccolspan');
        const rows: number = el.nativeElement.getAttribute('gcrowspan');
        el.nativeElement.style.gridColumn = `span ${columns || 1}`;
        el.nativeElement.style.gridRow = `span ${rows || 1}`;
    }
}
