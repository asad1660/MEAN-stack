import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthData } from './auth.model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token:string;
  private authStatusListner = new Subject<boolean>();
  private isAuthenticated = false;
  constructor(private http:HttpClient,private router :Router) { }

  getToken() {
  return this.token;
  }
  getIsAuth(){
    return this.isAuthenticated;
  }
  getAuthStatusListener(){
    return this.authStatusListner.asObservable();
  }
  createUser(email:string, password:string){
    const authData:AuthData = {email:email,password:password}
    this.http.post('http://localhost:3000/api/user/signup',authData)
    .subscribe(response => {
     console.log(response);
    })
  }
  login(email:string, password:string){
    const authData:AuthData = {email:email,password:password}
    this.http.post<{token:string}>('http://localhost:3000/api/user/login',authData)
    .subscribe(response => {
     const token =response.token;
      this.token= token;
      if(token){
        this.isAuthenticated = true;
        this.authStatusListner.next(true);
        this.router.navigate(['/'])
      }
      
      console.log(response);

    })
  }
  logout(){
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListner.next(false)
    this.router.navigate(['/'])
  }
}
