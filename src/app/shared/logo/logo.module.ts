import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageCropperModule } from 'ngx-image-cropper';
import { MaterialModule } from 'src/app/material.module';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { LogoComponent } from './logo.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MaterialModule,
        MaterialFileInputModule,
        ReactiveFormsModule,
        ImageCropperModule
    ],
    declarations: [
        LogoComponent
    ],
    exports: [
        LogoComponent
    ]
})
export class LogoModule { }
