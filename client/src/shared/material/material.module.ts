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
    MatMenuModule, MatSidenavModule, MatToolbarModule, MatListModule, MatDialogModule
  ],
  exports: [
    MatInputModule,
    MatRadioModule,
    MatButtonModule,
    MatCardModule,
    MatButtonToggleModule,
    MatIconModule,
    MatMenuModule, MatSidenavModule, MatToolbarModule, MatListModule, MatDialogModule
  ],
  declarations: []
})
export class MaterialModule { }
