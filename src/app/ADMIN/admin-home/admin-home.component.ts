import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.scss'
})
export class AdminHomeComponent  implements OnInit {
  user: any;
  adminMessage: string = '';
  campStatus: any;
  usersList: any[] = [];
  serviceRequests: any[] = [];
  selectedCamp: any;
  campMessages!: any[];
  campMessage: any;
  camps: any[] = [];  // Array to hold all camp details

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,private snackBar:MatSnackBar,
    private router: Router
  ) {

    this.loadCamps();
    this.loadCampMessages();
    this.loadServiceRequests();
    this.loadCampStatus()
  }

  ngOnInit(): void {
    this.afAuth.user.subscribe(user => {
      if (user) {
        this.user = user;
        this.loadAdminMessage();
        this.loadUsers();
        this.loadCampStatus();
        this.loadServiceRequests();
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  loadAdminMessage() {
    this.firestore.collection('camp').doc('admin').get().subscribe(doc => {
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

  loadCampStatus() {
    this.firestore.collection('campStatus').doc('current').get().subscribe(doc => {
      if (doc.exists) {
        this.campStatus = doc.data();
      }
    });
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

  this.camps.forEach(camp => {
    this.firestore.collection('campMessages').add({
      message: this.campMessage,
      campId: camp.id,
      timestamp: new Date()
    });
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
    this.afAuth.signOut().then(() => {
      this.router.navigate(['/login']);
    });
  }
}
