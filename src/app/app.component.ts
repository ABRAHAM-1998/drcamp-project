
import { Component, HostListener } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { Observable, Subscription, combineLatest, from, map } from "rxjs";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { Location } from '@angular/common';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
} from "@angular/fire/compat/firestore";
import { AuthService } from "./SERVICE/auth.service";
import { User } from "./SERVICE/model";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  user!: any;
  private userDataSubscription: Subscription | undefined;

  title = "DR-CAMP";
  userData: any | undefined;
  constructor(
    private snackBar: MatSnackBar,
    private router: Router,
    public afs: AngularFirestore,
    public authService: AuthService,
    private auth: AngularFireAuth,
    private location: Location
  ) {
    const encryptedUserData = localStorage.getItem("encryptedUserData");
    if (encryptedUserData) {
      const userEnc = atob(encryptedUserData!);
      const userData: User = {...JSON.parse(userEnc!)}
      this.user = userData
      console.log(userEnc,'===================================================',userData)
    }
  }
  goBack() {
    this.location.back();
  }
  goForward() {
    this.location.forward();
  }
  reLoad(){
    window.location.reload();
    // this.clearSiteCache()
  }


  ngOnInit(): void {
    const encodedUserData = localStorage.getItem("encryptedUserData");
    if (encodedUserData) {
      const userEnc = atob(encodedUserData);
      this.user = JSON.parse(userEnc);

      if (this.user) {
        window.removeEventListener("beforeunload", () => {
          this.authService.SignOut();
        });
      }

  }
}


  scrollTop(event: any) {
    window.scrollTo({ top: 0, behavior: 'auto' });

  }



  
}
