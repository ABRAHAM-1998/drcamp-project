import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { UserRegistrationComponent } from './user-registration/user-registration.component';
import { UserHomeComponent } from './user-home/user-home.component';
import { AddmemberComponent } from './addmember/addmember.component';
import { AddCampComponent } from './ADMIN/add-camp/add-camp.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatCommonModule, MatDateFormats, provideNativeDateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {MatSelectModule} from '@angular/material/select';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { MatCardModule } from '@angular/material/card';
import { AdminHomeComponent } from './ADMIN/admin-home/admin-home.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { CampSupervisorComponent } from './ADMIN/camp-supervisor/camp-supervisor.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
export const MY_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'YYYY-MM-DD', // Correct format for parsing (Year-Month-Day)
  },
  display: {
    dateInput: 'YYYY-MM-DD', // Display format as "09/07/1998"
    monthYearLabel: 'MMM YYYY', // Month-Year label as "Jul 1998"
    dateA11yLabel: 'DD/MM/YYYY', // Accessibility format
    monthYearA11yLabel: 'MMMM YYYY', // Full Month-Year label
  },
};




@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    UserRegistrationComponent,
    UserHomeComponent,
    AddmemberComponent,
    AddCampComponent,
    AdminHomeComponent,
    CampSupervisorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,ReactiveFormsModule,
    FormsModule,
    CommonModule,
    MatCommonModule,
    ReactiveFormsModule ,
    TextFieldModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatSelectModule,
    FormsModule,
    MatFormFieldModule,
    MatCardModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatButtonToggleModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
  ],
  providers: [
    DatePipe,
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }, // Set locale for DD/MM/YYYY format
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    provideNativeDateAdapter(),
    provideFirebaseApp(() => initializeApp({"projectId":"dr-camp","appId":"1:633302423967:web:0b34881a53eb0f7dacc5aa","storageBucket":"dr-camp.appspot.com","apiKey":"AIzaSyDwGg6H36MhVW3IRHfk6Z3DZW4tYg0CMf4","authDomain":"dr-camp.firebaseapp.com","messagingSenderId":"633302423967","measurementId":"G-RCDLSZ6L0B"})),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    provideAnimationsAsync(),
    {provide:FIREBASE_OPTIONS,useValue:{"projectId":"dr-camp","appId":"1:633302423967:web:0b34881a53eb0f7dacc5aa","storageBucket":"dr-camp.appspot.com","apiKey":"AIzaSyDwGg6H36MhVW3IRHfk6Z3DZW4tYg0CMf4","authDomain":"dr-camp.firebaseapp.com","messagingSenderId":"633302423967","measurementId":"G-RCDLSZ6L0B"}}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
