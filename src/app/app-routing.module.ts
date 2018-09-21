import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { UserParamComponent } from './user-param/user-param.component';
import {MainChatComponent} from './chat/main-chat/main-chat.component';
import {EditUserParamComponent} from './chat/edit-user-param/edit-user-param.component';

const routes: Routes = [
  {path: '', component: UserParamComponent},
  {
    path: 'chat',
    component: ChatComponent,
    children: [
      {path: 'main-chat', component: MainChatComponent},
      {path: 'edit-profile', component: EditUserParamComponent}
    ]
  }
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
