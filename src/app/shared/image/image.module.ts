import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCropperComponent } from './image-cropper.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageCropperModule } from 'ngx-image-cropper';
import { MaterialModule } from 'src/app/material.module';
import { MaterialFileInputModule } from 'ngx-material-file-input';

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
        ImageCropperComponent
    ],
    exports: [
        ImageCropperComponent
    ]
})
export class ImageModule { }
