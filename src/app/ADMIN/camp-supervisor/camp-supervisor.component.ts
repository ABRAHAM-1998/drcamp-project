

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
  campMessages: any[] =[];
  campMessage: any;
  camps: any[] = [];  // Array to hold all camp details
  campMembers: any[]=[];
  userMessages: any[]=[];
  incidentReports: any[] =[];

  constructor(
    private afAuth: AuthService,
    private firestore: AngularFirestore,private snackBar:MatSnackBar,
    private router: Router
  ) {

    this.loadCamps();
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
    this.loadCampMessages();
    this.loadStock()
        this.loadAdminMessage();
        // this.loadUsers();
        this.loadDoctors();
        this.loadMedicalCases();
        this.loadCampMembers();
        this.loadServiceRequests();
        this.loadUserMessages()
        this.loadIncidentReports();
      // } else {
      //   this.router.navigate(['/login']);
      // }
    // });
  }

  loadUserMessages() {
    this.firestore.collection('messages', ref => ref.orderBy('timestamp', 'desc').where('campId', '==', this.user.campId))
      .valueChanges()
      .subscribe((messages: any[]) => {
        this.userMessages = messages;
      });
  }
  loadAdminMessage() {
    this.firestore.collection('ADMIN-MESSAGE').doc('ADMIN-MESSAGE').get().subscribe(doc => {
      if (doc.exists) {
        let data: any = doc.data();
        this.adminMessage = data.message || 'No message from admin.';
      }
    });
  }

  // loadUsers() {
  //   this.firestore.collection('members',(ref)=>ref.where('campId'.'',this.user.campId)).get().subscribe(snapshot => {
  //     this.usersList = snapshot.docs.map(doc => doc.data());
  //   });
  // }
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
          this.campMembers = snapshot.docs.map(doc => doc.data());
          this.calculateItemCounts();  // Call function to count items
        } else {
          this.campMembers = [];
          this.itemCounts = this.initializeItemCounts(); // Reset counts if no data
        }
      }, error => {
        console.error("Error fetching camp members: ", error);
      });
    }
  }
  
  itemCounts: any = {};

initializeItemCounts() {
  return {
    food: 0,
    water: 0,
    medicine: 0,
    sanitaryItems: 0,
    clothing: {
      kids: 0,
      female: 0,
      male: 0,
      old: 0,
      fatty: 0
    },
    shelter: 0,
    emergencyAttention: 0
  };
}

calculateItemCounts() {
  this.itemCounts = this.initializeItemCounts(); // Reset counts

  this.campMembers.forEach(user => {
    if (user?.userRequests?.food) this.itemCounts.food++;
    if (user?.userRequests?.water) this.itemCounts.water++;
    if (user?.userRequests?.medicine) this.itemCounts.medicine++;
    if (user?.userRequests?.sanitaryItems) this.itemCounts.sanitaryItems++;
    if (user?.userRequests?.shelter) this.itemCounts.shelter++;
    if (user?.userRequests?.emergencyAttention) this.itemCounts.emergencyAttention++;

    // Clothing
    if (user?.userRequests?.clothing?.kids) this.itemCounts.clothing.kids++;
    if (user?.userRequests?.clothing?.female) this.itemCounts.clothing.female++;
    if (user?.userRequests?.clothing?.male) this.itemCounts.clothing.male++;
    if (user?.userRequests?.clothing?.old) this.itemCounts.clothing.old++;
    if (user?.userRequests?.clothing?.fatty) this.itemCounts.clothing.fatty++;
  });

  console.log("Item Counts: ", this.itemCounts);
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
  if (!this.user?.campId) return;

  this.firestore.collection('campMessages', ref => ref.where('campId', '==', this.user.campId))
    .snapshotChanges() // Use snapshotChanges to get document IDs
    .subscribe(snapshot => {
      this.campMessages = snapshot.map(doc => ({
        id: doc.payload.doc.id, // Extract document ID
        ...doc.payload.doc.data() as any
      }));
    });
}


sendCampMessage() {
  if (!this.campMessage.trim()) {
    this.snackBar.open('Please enter a message.', 'Close', { duration: 3000 });
    return;
  }

  this.firestore.collection('campMessages').add({
    campId: this.user.campId,
    message: this.campMessage,
    uid: this.user.uid,
    timestamp: new Date()
  });

  this.campMessages.push({
    campId: this.user.campId,
    message: this.campMessage,
    uid: this.user.uid,
    timestamp: new Date()
  });
  this.campMessage = '';
  this.snackBar.open('Message sent to the selected camp!', 'Close', { duration: 3000 });
}

stockItems = [
  { name: "🍛 Food", key: "food", quantity: 0 },
  { name: "💧 Water", key: "water", quantity: 0 },
  { name: "💊 Medicine", key: "medicine", quantity: 0 },
  { name: "🧻 Sanitary Items", key: "sanitaryItems", quantity: 0 },
  { name: "🏕️ Shelter", key: "shelter", quantity: 0 },
  { name: "🚨 Emergency Help", key: "emergencyAttention", quantity: 0 }
];

loadStock() {
  this.firestore.collection('campStock', ref => ref.where('campId', '==', this.user.campId))
    .valueChanges()
    .subscribe((stocks: any[]) => {
      if (stocks.length > 0) {
        this.stockItems.forEach(item => {
          const stockItem = stocks.find(s => s.itemKey === item.key);
          if (stockItem) {
            item.quantity = stockItem.quantity;
          }
        });
      }
    });
}

updateStock() {
  this.stockItems.forEach(item => {
    this.firestore.collection('campStock').doc(`${this.user.campId}_${item.key}`).set({
      campId: this.user.campId,
      itemKey: item.key,
      quantity: item.quantity
    }, { merge: true });
  });
}



doctors:any[] = [];
medicalCases:any[] = [];
newDoctor = { name: "", specialization: "", phone: "", availability: "Available" };
selectedMember: any;
selectedDoctor: any;
medicalIssue: string = '';
loadDoctors() {
  this.firestore.collection('doctors', ref => ref.where('campId', '==', this.user.campId))
    .snapshotChanges()
    .subscribe(snapshot => {
      this.doctors = snapshot.map(doc => {
        return { id: doc.payload.doc.id, ...doc.payload.doc.data() as any };
      });
    });
}


addDoctor() {
  if (this.newDoctor.name && this.newDoctor.specialization && this.newDoctor.phone) {
    this.firestore.collection('doctors').add({
      campId: this.user.campId,
      name: this.newDoctor.name,
      specialization: this.newDoctor.specialization,
      phone: this.newDoctor.phone,
      availability: this.newDoctor.availability
    }).then(() => {
      this.newDoctor = { name: "", specialization: "", phone: "", availability: "Available" };
    });
  }
}
loadMedicalCases() {
  this.firestore.collection('medicalCases', ref => ref.where('campId', '==', this.user.campId))
    .valueChanges()
    .subscribe((cases: any[]) => {
      this.medicalCases = cases;
    });
}

assignDoctor() {
  if (this.selectedMember && this.medicalIssue && this.selectedDoctor) {
    this.firestore.collection('medicalCases').doc(this.selectedMember.phoneNumber.toString()).set({
      campId: this.user.campId,
      name: this.selectedMember.name,
      age: this.selectedMember.age,
      issue: this.medicalIssue,
      assignedDoctor: this.selectedDoctor.name,
      phoneNumber: this.selectedMember.phoneNumber
    }, { merge: true }).then(() => {
      this.selectedMember = null;
      this.selectedDoctor = null;
      this.medicalIssue = "";
    });
  }
}

updateDoctorAvailability(doctor: any) {
  this.firestore.collection('doctors').doc(doctor.id).update({
    availability: doctor.availability
  }).then(() => {
    console.log("Doctor availability updated successfully!");
  }).catch(error => {
    console.error("Error updating availability: ", error);
  });
}


loadIncidentReports() {
  this.firestore.collection('incidentReports', ref => 
      ref.where('campId', '==', this.user.campId).orderBy('timestamp', 'desc'))
    .valueChanges()
    .subscribe((reports: any[]) => {
      this.incidentReports = reports;
    });
}

deleteMessage(messageId: string) {
  if (confirm("Are you sure you want to delete this message?")) {
    this.firestore.collection('campMessages').doc(messageId).delete()
      .then(() => {
        alert("Message deleted successfully.");
      })
      .catch(error => {
        console.error("Error deleting message: ", error);
        alert("Failed to delete the message.");
      });
  }
}

}
