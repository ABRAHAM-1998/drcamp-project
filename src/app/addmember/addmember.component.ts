import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-addmember',
  templateUrl: './addmember.component.html',
  styleUrl: './addmember.component.scss',
})
export class AddmemberComponent {
  memberForm: FormGroup;
  selectedCampId: string = '';
  camps: any[] = [];
  constructor(
    private fb: FormBuilder,
    private firestore: AngularFirestore,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // Initialize the form group
    this.memberForm = this.fb.group({
      name: ['', Validators.required],
      age: [null, Validators.required],
      dob: ['', Validators.required],
      gender: ['', Validators.required],
      bloodGroup: ['', Validators.required],
      address: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      campId: ['', Validators.required],
      aadharNumber: [''],
      houseNumber: [''],
      familyMembers: this.fb.array([this.createFamilyMember()]),
    });
  }

  // Getter for family members FormArray
  get familyMembers(): FormArray {
    return this.memberForm.get('familyMembers') as FormArray;
  }

  // Create a family member FormGroup
  createFamilyMember(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      age: [null, Validators.required],
      gender: ['', Validators.required],
    });
  }

  // Add a new family member to the form
  addFamilyMember(): void {
    this.familyMembers.push(this.createFamilyMember());
  }

  // Remove a family member from the form
  removeFamilyMember(index: number): void {
    if (this.familyMembers.length > 0) {
      this.familyMembers.removeAt(index);
   
    }
  }


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
  // Submit the form
  submitForm(): void {
    if (this.memberForm.valid) {
      const newMember = this.memberForm.value;
      this.firestore
        .collection('members')
        .add(newMember)
        .then(() => {
          this.snackBar.open('New member added successfully!', 'Close', {
            duration: 3000,
            panelClass: ['mat-toolbar', 'mat-primary'],
          });
          this.router.navigate(['/home']);
        })
        .catch((error) => {
          this.snackBar.open('Error adding member: ' + error.message, 'Close', {
            duration: 3000,
            panelClass: ['mat-toolbar', 'mat-warn'],
          });
        });
    } else {
      this.snackBar.open('Please fill out all required fields.', 'Close', {
        duration: 3000,
        panelClass: ['mat-toolbar', 'mat-warn'],
      });
    }
  }
}
