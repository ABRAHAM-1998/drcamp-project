import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { UserRegistrationComponent } from './user-registration/user-registration.component';
import { UserHomeComponent } from './user-home/user-home.component';
import { AddCampComponent } from './ADMIN/add-camp/add-camp.component';
import { AddmemberComponent } from './addmember/addmember.component';
import { AdminHomeComponent } from './ADMIN/admin-home/admin-home.component';
import { CampSupervisorComponent } from './ADMIN/camp-supervisor/camp-supervisor.component';

const routes: Routes = [
  {path:'login', component:LoginComponent, },
  {path:'registration',component:UserRegistrationComponent},
  {path:'userHome',component:UserHomeComponent},
  {path:'', redirectTo:'login', pathMatch:'full'},
  {path:'add-camp',component:AddCampComponent},
  {path:'add-member', component:AddmemberComponent},
  {path:'admin-home', component:AdminHomeComponent},
  {path:'camp-supervisor', component:CampSupervisorComponent},


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
