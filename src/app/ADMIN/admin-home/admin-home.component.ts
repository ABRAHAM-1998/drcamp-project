import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.scss',
})
export class AdminHomeComponent implements OnInit {
  user: any;
  adminMessage: string = '';
  campStatus: any;
  usersList: any[] = [];
  serviceRequests: any[] = [];
  selectedCamp: any;
  campMessages!: any[];
  campMessage: any;
  camps: any[] = []; // Array to hold all camp details
  doctors: any[] = [];
  campMembers: any[] = [];
  incidentReports: any[] =[]

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.loadCamps();
    this.loadCampMessages();
    this.loadServiceRequests();
    this.loadCampStatus();
    this.loadDoctors();
    this.loadAllCampStock();
    this.loadCampMembers()
    this.loadIncidentReports();
  }

  ngOnInit(): void {
    this.afAuth.user.subscribe((user) => {
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
    this.firestore
      .collection('camp')
      .doc('admin')
      .get()
      .subscribe((doc) => {
        if (doc.exists) {
          let data: any = doc.data();
          this.adminMessage = data.message || 'No message from admin.';
        }
      });
  }

  loadUsers() {
    this.firestore
      .collection('users')
      .get()
      .subscribe((snapshot) => {
        this.usersList = snapshot.docs.map((doc) => doc.data());
      });
  }

  loadCampStatus() {
    this.firestore
      .collection('campStatus')
      .doc('current')
      .get()
      .subscribe((doc) => {
        if (doc.exists) {
          this.campStatus = doc.data();
        }
      });
  }

  loadServiceRequests() {
    this.firestore
      .collection('serviceRequests')
      .get()
      .subscribe((snapshot) => {
        this.serviceRequests = snapshot.docs.map((doc) => doc.data());
      });
  }

  requestService(type: string) {
    this.firestore.collection('serviceRequests').add({
      type,
      user: this.user.email,
      timestamp: new Date(),
    });
  }

  campList: any[] = [];

  loadCamps() {
    this.firestore
      .collection('camps')
      .snapshotChanges()
      .subscribe((snapshot) => {
        this.camps = snapshot.map((doc) => {
          let data: any = doc.payload.doc.data();
          return {
            id: doc.payload.doc.id,
            name: data.name,
            location: data.location,
            capacity: data.capacity || 0,
            facilities: data.facilities || [],
          };
        });
      });
  }
  deleteCamp(campId: string) {
    if (confirm('Are you sure you want to delete this camp?')) {
      this.firestore
        .collection('camps')
        .doc(campId)
        .delete()
        .then(() => {
          console.log('Camp deleted successfully');
        })
        .catch((error) => {
          console.error('Error deleting camp: ', error);
        });
    }
  }

  // Send message to all camps
  sendMessageToAllCamps() {
    if (!this.campMessage.trim()) {
      this.snackBar.open('Message cannot be empty!', 'Close', {
        duration: 3000,
      });
      return;
    }

    this.firestore.collection('ADMIN-MESSAGE').doc('ADMIN-MESSAGE').set({
      message: this.campMessage,
      timestamp: new Date(),
    });

    this.snackBar.open('Message sent to all camps!', 'Close', {
      duration: 3000,
    });
    this.campMessage = ''; // Clear input after sending
  }
  addNewCamp() {
    this.router.navigate(['/add-camp']); // Redirects to the camp creation page
  }

  loadCampMessages() {
    if (!this.selectedCamp) return;

    this.firestore
      .collection('campMessages', (ref) =>
        ref.where('campId', '==', this.selectedCamp)
      )
      .get()
      .subscribe((snapshot) => {
        this.campMessages = snapshot.docs.map((doc) => doc.data());
      });
  }

  sendCampMessage() {
    if (!this.selectedCamp || !this.campMessage.trim()) {
      this.snackBar.open('Please select a camp and enter a message.', 'Close', {
        duration: 3000,
      });
      return;
    }

    this.firestore.collection('campMessages').add({
      campId: this.selectedCamp,
      message: this.campMessage,
      timestamp: new Date(),
    });

    this.campMessages.push(this.campMessage);
    this.campMessage = '';
    this.snackBar.open('Message sent to the selected camp!', 'Close', {
      duration: 3000,
    });
  }

  logout() {
    this.afAuth.signOut().then(() => {
      this.router.navigate(['/login']);
    });
  }

  loadDoctors() {
    this.firestore
      .collection('doctors')
      .snapshotChanges()
      .subscribe((snapshot) => {
        this.doctors = snapshot.map((doc) => {
          return { id: doc.payload.doc.id, ...(doc.payload.doc.data() as any) };
        });
      });
  }

  stockItems = [
    { name: '🍛 Food', key: 'food', quantity: 0 },
    { name: '💧 Water', key: 'water', quantity: 0 },
    { name: '💊 Medicine', key: 'medicine', quantity: 0 },
    { name: '🧻 Sanitary Items', key: 'sanitaryItems', quantity: 0 },
    { name: '🏕️ Shelter', key: 'shelter', quantity: 0 },
    { name: '🚨 Emergency Help', key: 'emergencyAttention', quantity: 0 },
  ];

  allCampStocks: { [campId: string]: { itemKey: string; quantity: number }[] } =
    {};

  loadAllCampStock() {
    const groupedStock: {
      [campId: string]: { itemKey: string; quantity: number }[];
    } = {};

    this.firestore
      .collection('campStock')
      .valueChanges()
      .subscribe((stocks: any[]) => {
        stocks.forEach((stock: any) => {
          const campId = stock.campId as string;
          if (!groupedStock[campId]) {
            groupedStock[campId] = [];
          }
          groupedStock[campId].push({
            itemKey: stock.itemKey,
            quantity: stock.quantity,
          });
        });

        this.allCampStocks = groupedStock;
      });
  }
  getStockQuantity(campId: string, itemKey: string): number {
    const campStock = this.allCampStocks[campId];
    const item = campStock?.find((s) => s.itemKey === itemKey);
    return item ? item.quantity : 0;
  }

  loadCampMembers() {

      this.firestore
        .collection('members')
        .get()
        .subscribe(
          (snapshot) => {
            if (!snapshot.empty) {
              this.campMembers = snapshot.docs.map((doc) => doc.data());
              console.log('Camp members: ', this.campMembers);
            } else {
            }
          },
          (error) => {
            console.error('Error fetching camp members: ', error);
          }
        );
  }

loadIncidentReports() {
  this.firestore.collection('incidentReports').valueChanges()
    .subscribe((reports: any[]) => {
      this.incidentReports = reports;
    });
}
}
