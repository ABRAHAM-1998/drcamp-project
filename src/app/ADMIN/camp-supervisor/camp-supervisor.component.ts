

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../SERVICE/auth.service';
import { User } from '../../SERVICE/model';

@Component({
  selector: 'app-camp-supervisor',
  templateUrl: './camp-supervisor.component.html',
  styleUrl: './camp-supervisor.component.scss'
})
export class CampSupervisorComponent implements OnInit {
  user!: User;
  adminMessage: string = '';
  campStatus: any;
  usersList: any[] = [];
  serviceRequests: any[] = [];
  selectedCamp: any;
  campMessages!: any[];
  campMessage: any;
  camps: any[] = [];  // Array to hold all camp details
  campMembers: any[]=[];

  constructor(
    private afAuth: AuthService,
    private firestore: AngularFirestore,private snackBar:MatSnackBar,
    private router: Router
  ) {

    this.loadCamps();
    this.loadCampMessages();
    this.loadServiceRequests();
    this.loadCampMembers()
  }

  ngOnInit(): void {
    const encodedUserData = localStorage.getItem("encryptedUserData");
    if (encodedUserData) {
      const userEnc = atob(encodedUserData);
      this.user = JSON.parse(userEnc);

    }
    // this.afAuth.user.subscribe(user => {
    //   if (user) {
        // this.user = user;
        this.loadAdminMessage();
        this.loadUsers();
        this.loadCampMembers();
        this.loadServiceRequests();
      // } else {
      //   this.router.navigate(['/login']);
      // }
    // });
  }

  loadAdminMessage() {
    this.firestore.collection('ADMIN-MESSAGE').doc('ADMIN-MESSAGE').get().subscribe(doc => {
      if (doc.exists) {
        let data: any = doc.data();
        this.adminMessage = data.message || 'No message from admin.';
      }
    });
  }

  loadUsers() {
    this.firestore.collection('users').get().subscribe(snapshot => {
      this.usersList = snapshot.docs.map(doc => doc.data());
    });
  }
  loadCampMembers() {
    const encodedUserData = localStorage.getItem("encryptedUserData");
    if (encodedUserData) {
      const userEnc = atob(encodedUserData);
      this.user = JSON.parse(userEnc);
console.log(this.user);
    
    this.firestore.collection('members', ref => ref.where('campId', '==', this?.user.campId))
      .get()
      .subscribe(snapshot => {
        if (!snapshot.empty) {
          this.campMembers = snapshot.docs.map(doc => (doc.data() ));
        } else {
          this.campMembers = []; // Handle case where no members found
        }
      }, error => {
        console.error("Error fetching camp members: ", error);
      });
    }
  }
  
  loadServiceRequests() {
    this.firestore.collection('serviceRequests').get().subscribe(snapshot => {
      this.serviceRequests = snapshot.docs.map(doc => doc.data());
    });
  }

  requestService(type: string) {
    this.firestore.collection('serviceRequests').add({
      type,
      user: this.user.email,
      timestamp: new Date()
    });
  }

  campList: any[] = [];




loadCamps() {
  this.firestore.collection('camps').snapshotChanges().subscribe(snapshot => {
    this.camps = snapshot.map(doc => {
      let data: any = doc.payload.doc.data();
      return {
        id: doc.payload.doc.id,
        name: data.name,
        location: data.location,
        capacity: data.capacity || 0,
        facilities: data.facilities || []
      };
    });
  });
}

// Send message to all camps
sendMessageToAllCamps() {
  if (!this.campMessage.trim()) {
    this.snackBar.open('Message cannot be empty!', 'Close', { duration: 3000 });
    return;
  }

    this.firestore.collection('ADMIN-MESSAGE').doc('ADMIN-MESSAGE').set({
      message: this.campMessage,
      timestamp: new Date()
    });

  this.snackBar.open('Message sent to all camps!', 'Close', { duration: 3000 });
  this.campMessage = '';  // Clear input after sending
}
addNewCamp() {
  this.router.navigate(['/add-camp']); // Redirects to the camp creation page
}


loadCampMessages() {
  if (!this.selectedCamp) return;
  
  this.firestore.collection('campMessages', ref => ref.where('campId', '==', this.selectedCamp))
    .get().subscribe(snapshot => {
      this.campMessages = snapshot.docs.map(doc => doc.data());
  });
}

sendCampMessage() {
  if (!this.selectedCamp || !this.campMessage.trim()) {
    this.snackBar.open('Please select a camp and enter a message.', 'Close', { duration: 3000 });
    return;
  }

  this.firestore.collection('campMessages').add({
    campId: this.selectedCamp,
    message: this.campMessage,
    timestamp: new Date()
  });

  this.campMessages.push(this.campMessage);
  this.campMessage = '';
  this.snackBar.open('Message sent to the selected camp!', 'Close', { duration: 3000 });
}


  logout() {

    this.afAuth.SignOut().then(() => {
      this.router.navigate(['/login']);
    });
  }
}
