import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UserParamComponent} from './user-param/user-param.component';
import {AppRoutingModule} from './app-routing.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ChatComponent} from './chat/chat.component';
import {MaterialModule} from '../shared/material/material.module';
import {MainChatComponent} from './chat/main-chat/main-chat.component';
import {EditUserParamComponent} from './chat/edit-user-param/edit-user-param.component';
import {WelcomePageComponent} from './welcome-page/welcome-page.component';
import {HttpClientModule} from "@angular/common/http";
import {ChooseAvatarComponent} from "./choose-avatar/choose-avatar.component";
import {StorageServiceModule} from  "ngx-webstorage-service";
import {UserLogInComponent} from './user-log-in/user-log-in.component';
import {UserProfileComponent} from "./chat/user-profile/user-profile.component";
import {DirectMessagesRoomComponent} from "./chat/direct-messages-room/direct-messages-room.component";
import {ChooseMessageManipulatingComponent} from "./choose-message-manipulating/choose-message-manipulating.component";
import {ImageCropperModule} from 'ngx-image-cropper';
import {AvatarCropperComponent} from "./user-param/avatar-cropper/avatar-cropper.component";

@NgModule({
  declarations: [
    AppComponent,
    UserParamComponent,
    ChatComponent,
    MainChatComponent,
    EditUserParamComponent,
    WelcomePageComponent,
    ChooseAvatarComponent,
    UserLogInComponent,
    UserProfileComponent,
    DirectMessagesRoomComponent,
    ChooseMessageManipulatingComponent,
    AvatarCropperComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    MaterialModule,
    BrowserAnimationsModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    StorageServiceModule,
    ImageCropperModule
  ],
  entryComponents: [
    ChooseAvatarComponent,
    ChooseMessageManipulatingComponent,
    AvatarCropperComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
