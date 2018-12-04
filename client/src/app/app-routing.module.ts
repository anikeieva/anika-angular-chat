import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {ChatComponent} from './chat/chat.component';
import {MainChatComponent} from './chat/main-chat/main-chat.component';
import {EditUserParamComponent} from './chat/edit-user-param/edit-user-param.component';
import {WelcomePageComponent} from './welcome-page/welcome-page.component';
import {UserProfileComponent} from "./chat/user-profile/user-profile.component";
import {DirectMessagesRoomComponent} from "./chat/direct-messages-room/direct-messages-room.component";

const routes: Routes = [
  {path: '', component: WelcomePageComponent},
  {
    path: 'chat',
    component: ChatComponent,
    children: [
      {path: 'main-chat', component: MainChatComponent},
      {path: 'edit-profile', component: EditUserParamComponent},
      {path: 'user-profile', component: UserProfileComponent},
      {path: 'direct-messages-room', component: DirectMessagesRoomComponent}
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
