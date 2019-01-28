import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule, MatDialogModule,
  MatIconModule,
  MatInputModule, MatListModule,
  MatMenuModule,
  MatRadioModule, MatSidenavModule, MatToolbarModule
} from '@angular/material';
import {LayoutModule} from "@angular/cdk/layout";

@NgModule({
  imports: [
    CommonModule,
    MatInputModule,
    MatRadioModule,
    MatButtonModule,
    MatCardModule,
    MatButtonToggleModule,
    MatIconModule,
    MatMenuModule, MatSidenavModule, MatToolbarModule, MatListModule, MatDialogModule, MatButtonToggleModule,
    LayoutModule
  ],
  exports: [
    MatInputModule,
    MatRadioModule,
    MatButtonModule,
    MatCardModule,
    MatButtonToggleModule,
    MatIconModule,
    MatMenuModule, MatSidenavModule, MatToolbarModule, MatListModule, MatDialogModule, MatButtonToggleModule,
    LayoutModule
  ],
  declarations: []
})
export class MaterialModule { }
