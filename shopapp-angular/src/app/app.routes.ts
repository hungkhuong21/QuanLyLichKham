import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin/admin.component';
import { UserComponent } from './admin/user/user.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { VerifyCodeComponent } from './verify-code/verify-code.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ReceptionComponent } from './reception/reception.component';
import { ReceptionDirectComponent } from './reception-direct/reception-direct.component';
import { ReceptionUpdateProfileComponent } from './reception-update-profile/reception-update-profile.component';
import { ReceptionDailyListComponent } from './reception-daily-list/reception-daily-list.component';
import { DoctorManagementComponent } from './admin/doctor-management/doctor-management.component';
import { ScheduleManagementComponent } from './admin/schedule-management/schedule-management.component';
import { PatientManagementComponent } from './admin/patient-management/patient-management.component';
import { AppointmentManagementComponent } from './admin/appointment-management/appointment-management.component';
import { DoctorDashboardComponent } from './doctor-dashboard/doctor-dashboard.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'verify-code', component: VerifyCodeComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'reception', component: ReceptionComponent },
  { path: 'reception/direct', component: ReceptionDirectComponent },
  { path: 'reception/update-profile', component: ReceptionUpdateProfileComponent },
  { path: 'reception/daily-list', component: ReceptionDailyListComponent },
  { path: 'doctor/dashboard', component: DoctorDashboardComponent },
  {
    path: 'admin',
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'users', component: UserComponent },
      { path: 'doctor-management', component: DoctorManagementComponent },
      { path: 'patient-management', component: PatientManagementComponent },
      { path: 'appointment-management', component: AppointmentManagementComponent },
      { path: 'schedule-management', component: ScheduleManagementComponent }
    ]
  },
  
];
