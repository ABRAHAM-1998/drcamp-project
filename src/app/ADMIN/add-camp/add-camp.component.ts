import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-camp',
  templateUrl: './add-camp.component.html',
  styleUrls: ['./add-camp.component.scss']
})
export class AddCampComponent {
  camp = {
    name: '',
    location: '',
    capacity: null,
    facilities: []
  };

  availableFacilities = ['Medical Support', 'Food Supply', 'Clean Water', 'Shelter', 'Security', 'Electricity'];

  constructor(
    private firestore: AngularFirestore,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  addCamp() {
    if (!this.camp.name || !this.camp.location || !this.camp.capacity) {
      this.snackBar.open('Please fill all required fields.', 'Close', { duration: 3000 });
      return;
    }

    this.firestore.collection('camps').add(this.camp).then(() => {
      this.snackBar.open('Camp added successfully!', 'Close', { duration: 3000 });
      this.router.navigate(['/admin-dashboard']); // Redirect to admin panel
    }).catch(error => {
      console.error('Error adding camp:', error);
      this.snackBar.open('Failed to add camp. Try again.', 'Close', { duration: 3000 });
    });
  }

  cancel() {
    this.router.navigate(['/admin-dashboard']); // Redirect back if canceled
  }
}
