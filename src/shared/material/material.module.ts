import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
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
    MatMenuModule, MatSidenavModule, MatToolbarModule, MatListModule
  ],
  exports: [
    MatInputModule,
    MatRadioModule,
    MatButtonModule,
    MatCardModule,
    MatButtonToggleModule,
    MatIconModule,
    MatMenuModule, MatSidenavModule, MatToolbarModule, MatListModule
  ],
  declarations: []
})
export class MaterialModule { }
