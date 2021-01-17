import { TestBed, waitForAsync } from '@angular/core/testing';
import { RootComponent } from './root.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { AppSharedModule } from 'src/app/shared/app-shared.module';
import { DetailsModule } from '../details/details.module';
import { ViewAreaModule } from 'src/app/shared/view-area/view-area.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
        imports: [
            CommonModule,
            RouterModule,
            MaterialModule,
            AppSharedModule,
            DetailsModule,
            ViewAreaModule,
            RouterTestingModule.withRoutes([]),
        ],
      declarations: [
        RootComponent
      ],
    }).compileComponents();
  }));



//   it('should create the app', async(() => {
//     const fixture = TestBed.createComponent(RootComponent);
//     const app = fixture.debugElement.componentInstance;
//     expect(app).toBeTruthy();
//   }));
//   it(`should have as title 'app'`, async(() => {
//     const fixture = TestBed.createComponent(RootComponent);
//     const app = fixture.debugElement.componentInstance;
//     expect(app.title).toEqual('app');
//   }));
//   it('should render title in a h1 tag', async(() => {
//     const fixture = TestBed.createComponent(RootComponent);
//     fixture.detectChanges();
//     const compiled = fixture.debugElement.nativeElement;
//     expect(compiled.querySelector('h1').textContent).toContain('Welcome to city-hub!');
//   }));
});
