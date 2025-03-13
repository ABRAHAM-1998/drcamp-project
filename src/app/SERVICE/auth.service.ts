import { Injectable, NgZone } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFirestore, } from "@angular/fire/compat/firestore";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { User } from "./model";

@Injectable({
  providedIn: "root",
})
export class AuthService {

  public Errormessage: any;

  private readonly userDataKey = "encryptedUserData";
  constructor(
    private snackBar: MatSnackBar,
    public afs: AngularFirestore,
    public afAuth: AngularFireAuth,
    public router: Router,
    public ngZone: NgZone
  ) {

  }
  //============================coded by Abraham Jolly===================================
  //============================Sign In USer=============================================

  async SignIn(email: string, password: string) {
    this.snackBar.open("Logging in .. Please wait..", "Close", {
      duration: 5000,
      panelClass: ["snackbar"],
    });

    return this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then(async (result) => {
        if (result.user) {
          const userData = await this.getUserData(result.user?.uid);
          return userData;
        } else {
          this.snackBar.open("FAILED..", "Close", {
            duration: 4000,
            panelClass: ["snackbar"],
          });
          return null; // if the no user
        }
      })
      .catch((error) => {
        this.showLoginError(error.code);
        return null; // If Some error, no user!!!!
      });
  }
  //============================coded by Abraham Jolly===================================
  //============================Error Messages=============================================

  showLoginError(errorCode: string) {
    let message: string;
    switch (errorCode) {
      case "auth/invalid-email":
        message = "Invalid email";
        break;
      case "auth/user-token-expired":
        message = "The user token has expired";
        break;
      case "auth/too-many-requests":
        message = "Too many requests. Try again later";
        break;
      case "auth/provider-already-linked":
        message = "The provider is already linked to this account";
        break;

      case "auth/account-exists-with-different-credential":
        message =
          "There is already an account with the same email address but different sign-in credentials";
        break;

      case "auth/user-disabled":
        message = "User account is disabled";
        break;
      case "auth/user-not-found":
        message = "Invalid email address or password";
        break;
      case "auth/invalid-credential":
        message = "Invalid email address or password";
        break;
      default:
        message = "An error occurred. Please try again later.";
        break;
    }
    this.snackBar.open(message, "Close", {
      duration: 4000,
      panelClass: ["snackbar"],
    });
    this.Errormessage = message;
  }
  //============================coded by Abraham Jolly===================================
  //============================Email Verification=======================================
  // Send email verfificaiton when new user sign up
  SendVerificationMail() {
    return this.afAuth.currentUser
      .then((u: any) => u.sendEmailVerification())
      .then((res) => {
        this.snackBar.open(
          " EMAIL VERIFICATION SENDED SUCCESSFULLY..",
          "Close",
          {
            duration: 4000,
            panelClass: ["snackbar"],
          }
        );
        console.log(res.message);

        this.router.navigate(["verify-email-address"]);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }
  //============================coded by Abraham Jolly===================================
  //============================Login Check =============================================
  // Returns true when user is looged in
  async isLoggedIn(): Promise<boolean> {
    const encryptedUserData = localStorage.getItem("encryptedUserData");
    if (encryptedUserData) {
      const userEnc = atob(encryptedUserData!);
      const userData: User = JSON.parse(userEnc!);
      return userData !== null && await this.afAuth.currentUser
        ? true
        : false
    } else {
      return false
    }
  }
  async isLoggedInUser(): Promise<boolean> {
    const encryptedUserData = localStorage.getItem("encryptedUserData");
    if (encryptedUserData) {
      const userEnc = atob(encryptedUserData!);
      const userData: User = JSON.parse(userEnc!);
      return userData !== null &&  userData.role == 'USER'
        ? true
        : false
    } else {
      return false
    }
  }

  //============================coded by Abraham Jolly===================================
  //============================Sign Out USer=============================================
  SignOut() {
    return this.afAuth
      .signOut()
      .then((result) => {
        localStorage.removeItem("encryptedUserData");
        this.router.navigate(["/login"]);
        this.snackBar.open(" LOGOUT!!!..", "Close", {
          duration: 4000,
          panelClass: ["snackbar"],
        });
        window.location.reload();
      })
      .catch((error) => {
        this.snackBar.open(" You have been successfully logged out.", "Close", {
          duration: 4000,
          panelClass: ["snackbar"],
        });
      });
  }
  //============================coded by Abraham Jolly===================================
  //============================Get User Data =============================================

  async getUserData(uid: string | undefined): Promise<User | null> {
    if (!uid) {
      return null;
    }

    try {
      const userDoc = await this.afs.collection('users').doc<User>(uid).get().toPromise();
      if (userDoc?.exists) {
        return userDoc.data() as User;
      } else {
        return null;
      }
    } catch (error) {
      this.snackBar.open('Failed to retrieve user data', 'Close', {
        duration: 4000,
        panelClass: ['snackbar'],
      });
      return null;
    }
  }
  //============================coded by Abraham Jolly===================================
  //============================End of the code =============================================


}