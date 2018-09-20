import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { UserParamComponent } from './user-param/user-param.component';
import {MainChatComponent} from './chat/main-chat/main-chat.component';

const routes: Routes = [
  {path: '', component: UserParamComponent},
  {path: 'chat', component: ChatComponent},
  {path: 'main-chat', component: MainChatComponent}
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ],
  declarations: []
})
export class AppRoutingModule { }
