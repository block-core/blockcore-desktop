import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GridCellDirective } from './grid-cell.directive';

describe('GridCellDirective', () => {
    let directive: GridCellDirective;
    let fixture: ComponentFixture<GridCellDirective>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [GridCellDirective]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GridCellDirective);
        directive = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });
});
