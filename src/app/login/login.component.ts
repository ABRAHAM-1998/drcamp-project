import { Component } from '@angular/core';
import { TextFieldModule } from '@angular/cdk/text-field';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NavigationExtras, Router, RouterModule } from "@angular/router";
import { MatCommonModule } from '@angular/material/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../SERVICE/auth.service';
import { User } from '../SERVICE/model';
import { Timestamp } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({

  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',

})
export class LoginComponent {
  loginType: string = 'admin'; // Default to admin login

  public password: any;
  public email: any;
  private readonly userDataKey = "encryptedUserData";
  userData: any;
  errorMessage!: string;

  constructor(
    public authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private afs: AngularFirestore,
    private fb: FormBuilder,
    private datePipe: DatePipe
  ) {}

  async onLogin(email: string, password: string) {
    try {
      const user = (await this.authService.SignIn(email, password))
      if (user) {
        console.log(user)
        const encryptedUserData = btoa(JSON.stringify(user));
        localStorage.setItem(this.userDataKey, encryptedUserData);
       if(user.role == 'ADMIN'){ //CAMP-SUPERVISOR
        this.router.navigate(['admin-home'])
       }else{
        this.router.navigate(['camp-supervisor'])
       }

      } else {
        console.error("Invalid user object:", user);
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  }

  async ngOnInit(): Promise<void> {
    if (await this.authService.isLoggedIn()) {
      const encryptedUserData = localStorage.getItem("encryptedUserData");
      if (encryptedUserData) {
        const userEnc = atob(encryptedUserData!);
        const userData: User = JSON.parse(userEnc!);
        if(userData.role == 'ADMIN'){ //CAMP-SUPERVISOR
          this.router.navigate(['admin-home'])
         }else{
          this.router.navigate(['camp-supervisor'])
         }
      }
    }else{
      if(await this.authService.isLoggedInUser()){
        const encryptedUserData = localStorage.getItem("encryptedUserData");
        if (encryptedUserData) {
          const userEnc = atob(encryptedUserData!);
          const userData: User = JSON.parse(userEnc!);
          if(userData.role == 'USER'){ //CAMP-SUPERVISOR
            this.fn_Route('userHome',userData)
           }
        }
      }
    }

  }


  formatDate(date: string | null): string {
    console.log('Raw Input:', date);
    
    if (!date) return ''; // Handle null case
    
    // Expecting format "dd/MM/yyyy"
    const parts = date.split('/'); // Split the date string by "/"
    
    if (parts.length !== 3) return 'Invalid Date'; // Ensure correct format
    
    const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`; // Convert to "yyyy-MM-dd"
    console.log('Formatted Date:', formattedDate);
  
    return formattedDate; // ✅ Returns "2025-03-26"
  }
  
  


onMemberLogin(phone:string, dateOfBirth:string) {
  console.log(dateOfBirth)
  // const timestamp = Timestamp.fromDate(dateOfBirth);

  this.afs
    .collection<any>('members')
    .ref
    .where('phoneNumber', '==', phone)
    .where('dob', '==', dateOfBirth)
    .limit(1)
    .get()
    .then(async (querySnapshot) => {
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const memberData = doc.data() as any;
        this.userData = { ...memberData, id: doc.id }; // Assign data along with document ID
        console.log(this.userData);

        const encodedUserData = btoa(JSON.stringify(this.userData));
        localStorage.setItem('encryptedUserData', encodedUserData);
        this.fn_Route('/userHome', this.userData);
      } else {
        // Student not found
        console.log('Student not found');
        this.errorMessage = 'User not found,Please check your Mobile Number or Date of birth'

      }
    })
    .catch((error) => {
      // Handle any errors that occur during the query
      console.error('Error getting student details:', error);
      this.errorMessage = (`Error getting Member details:', ${error}`);
    });
}
fn_Route(route: string, data: any) {
  this.router.navigate([route]);
  const navigationExtras: NavigationExtras = {
    state: data,
  };
  this.router.navigate([route], navigationExtras);
}

}