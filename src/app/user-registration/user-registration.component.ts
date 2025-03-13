import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.scss']
})
export class UserRegistrationComponent implements OnInit {
  email: string = '';
  password: string = '';
  name: string = '';
  phoneNumber: string = '';
  address: string = '';
  selectedCampId: string = '';
  camps: any[] = [];
  errorMessage: string = '';

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadCamps();
  }

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

  async onSubmit() {
    try {
      // Create user in Firebase Authentication
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(this.email, this.password);

      // Store user data in Firestore
      await this.firestore.collection('users').doc(userCredential.user?.uid).set({
        name: this.name,
        email: this.email,
        phoneNumber: this.phoneNumber,
        address: this.address,
        campId: this.selectedCampId,  // Store selected camp ID
        uid: userCredential.user?.uid,
        role:'CAMP-SUPERVISOR'
      });

      this.snackBar.open('Registration Successful!', 'Close', {
        duration: 3000,
        panelClass: ['bg-success', 'text-light']
      });

      // Redirect to home page
      this.router.navigate(['/home']);
    } catch (error: any) {
      this.errorMessage = error.message;
      this.snackBar.open(this.errorMessage, 'Close', {
        duration: 3000,
        panelClass: ['bg-danger', 'text-light']
      });
    }
  }
}
