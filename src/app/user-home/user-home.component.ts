import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../SERVICE/auth.service';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss']
})
export class UserHomeComponent implements OnInit {
  user: any;
  adminMessage: string = '';
  campStatus: any;
  usersList: any[] = [];
  serviceRequests: any[] = [];
  selectedCamp: any;
  campMessages!: any[];
  campMessage: any;
  camps: any[] = [];  
  state: any;

  newMessage: string = '';
  messages: any[] = [];


  userId!: string;
  requests :any= {
    food: false,
    water: false,
    medicine: false,
    shelter: false,
    sanitaryItems: false,
    emergencyAttention: false,
    clothing: {
      kids: false,
      female: false,
      male: false,
      old: false,
      fatty: false
    }
  };

  constructor(
    private afAuth: AuthService,
    private firestore: AngularFirestore,private snackBar:MatSnackBar,
    private router: Router
  ) {
    this.state = this.router.getCurrentNavigation()?.extras.state;
    console.log(this.state);
    this.loadMessages();
    this.loadCamps();
    this.loadServiceRequests();
    this.loadCampStatus()
  }
  toggleRequest(service: string) {
    this.requests[service] = !this.requests[service];
  }

  

  toggleClothing(type: string) {
    this.requests.clothing[type] = !this.requests.clothing[type];
  }

  submitRequests() {
    this.firestore.collection('members').doc(this.state['id']).update({
      userRequests: this.requests
    }).then(() => {
      alert('Your request has been updated!');
    }).catch(error => {
      console.error('Error updating request:', error);
    });
  }
  loadRequests() {
    this.firestore.collection('members').doc(this.state['id']).get().subscribe(doc => {
      if (doc.exists) {
        const data: any = doc.data();
        if (data.userRequests) {
          this.requests = data.userRequests;
        }
      }
    });
  }

  ngOnInit(): void {
    // this.afAuth.user.subscribe(user => {
    //   if (user) {
        // this.user = user;
        this.loadRequests()
        this.loadAdminMessage();
        this.loadUsers();
        this.loadCampStatus();
        this.loadServiceRequests();
        this.loadCampMessages();
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



  report = {
    type: '',
    name: '',
    description: '',
    contact: '',
    status: 'Pending',
    timestamp: new Date(),
    campId:'',
    id:''
  };


  setReportType(type: string) {
    this.report.type = type;
  }

  submitIncidentReport() {
    if (!this.report.type || !this.report.description || !this.report.contact) {
      alert("Please fill in all required fields.");
      return;
    }
    console.log(this.state)
    this.report.campId =this.state['campId']
    this.report.id =this.state['id']


    this.firestore.collection('incidentReports').add(this.report)
      .then(() => {
        alert("Incident report submitted successfully.");
        this.resetForm();
      })
      .catch(error => {
        console.error("Error submitting report: ", error);
        alert("Failed to submit the report. Try again.");
      });
  }

  resetForm() {
    this.report = {
      type: '',
      name: '',
      description: '',
      contact: '',
      status: 'Pending',
      timestamp: new Date(),
      campId: '',
      id:''
    };
  }

  loadMessages() {
    this.firestore.collection('messages', ref => ref.orderBy('timestamp', 'desc').where('senderId', '==', this.state['id']))
      .valueChanges()
      .subscribe((messages: any[]) => {
        this.messages = messages;
      });
  }
  sendMessage() {
    if (!this.newMessage.trim()) return;

    const messageData = {
      sender: this.state['name'],
      text: this.newMessage,
      timestamp: new Date(),
      senderId: this.state['id'],
      campId: this.state['campId'],
      phoneNumber: this.state['phoneNumber']
    };

    this.firestore.collection('messages').add(messageData)
      .then(() => {
        this.newMessage = '';
      })
      .catch(error => {
        console.error('Error sending message:', error);
      });
  }

  loadCampMessages() {
    if (! this.state['campId']) return;
    
    this.firestore.collection('campMessages', ref => ref.where('campId', '==',  this.state['campId']))
      .get().subscribe(snapshot => {
        this.campMessages = snapshot.docs.map(doc => doc.data());
    });
  }

}
