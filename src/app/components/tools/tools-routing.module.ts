import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ToolsComponent } from './tools.component';

const routes: Routes = [
    {
        path: '', component: ToolsComponent,
        data: {
            title: 'Tools'
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class ToolsRoutingModule { }
