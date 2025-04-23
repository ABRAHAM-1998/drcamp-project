import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { UserRegistrationComponent } from './user-registration/user-registration.component';
import { UserHomeComponent } from './user-home/user-home.component';
import { AddCampComponent } from './ADMIN/add-camp/add-camp.component';
import { AddmemberComponent } from './addmember/addmember.component';
import { AdminHomeComponent } from './ADMIN/admin-home/admin-home.component';
import { CampSupervisorComponent } from './ADMIN/camp-supervisor/camp-supervisor.component';
import { AuthGuard } from './SERVICE/auth.guard';

const routes: Routes = [
  {path:'login', component:LoginComponent, },
  {path:'registration',component:UserRegistrationComponent},
  {path:'userHome',component:UserHomeComponent},
  {path:'', redirectTo:'login', pathMatch:'full'},
  {path:'add-camp',component:AddCampComponent,canActivate:[AuthGuard]},
  {path:'add-member', component:AddmemberComponent,canActivate:[AuthGuard]},
  {path:'admin-home', component:AdminHomeComponent,canActivate:[AuthGuard]},
  {path:'camp-supervisor', component:CampSupervisorComponent,canActivate:[AuthGuard]},


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
