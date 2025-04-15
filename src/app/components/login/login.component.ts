import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GmailService } from '../../services/gmail.service';
declare const google: any;
import { SmartBotService } from '../../services/smart-bot.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(
      private gmailService: GmailService, 
      private router: Router,
      private smartBot: SmartBotService
  ) {}
  ngOnInit(): void {
    google.accounts.id.initialize({
      client_id: '61178546523-sf6cpcn5bhgjl2bnoascmk8fiqn4bvv4.apps.googleusercontent.com',  // <-- replace this
      callback: (response: any) => this.handleCredentialResponse(response),
    });

    google.accounts.id.renderButton(
      document.getElementById('google-signin-btn'),
      { theme: 'outline', size: 'large' }
    );
  }

  handleCredentialResponse(response: any): void {
    console.log('JWT Token from Google:', response.credential);
    this.gmailService.authenticate()
    .then(() => {
      this.router.navigate(['/inbox']);
      this.smartBot.processLatestEmailAndRespond();
    })
    .catch(err => {
      console.error('❌ Gmail Auth Error:', err);
    });
  }

}
