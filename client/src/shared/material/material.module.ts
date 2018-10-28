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

@NgModule({
  imports: [
    CommonModule,
    MatInputModule,
    MatRadioModule,
    MatButtonModule,
    MatCardModule,
    MatButtonToggleModule,
    MatIconModule,
    MatMenuModule, MatSidenavModule, MatToolbarModule, MatListModule, MatDialogModule, MatButtonToggleModule
  ],
  exports: [
    MatInputModule,
    MatRadioModule,
    MatButtonModule,
    MatCardModule,
    MatButtonToggleModule,
    MatIconModule,
    MatMenuModule, MatSidenavModule, MatToolbarModule, MatListModule, MatDialogModule, MatButtonToggleModule
  ],
  declarations: []
})
export class MaterialModule { }
