//original

// import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
// import { GmailService } from '../../services/gmail.service';
// declare const google: any;
// import { SmartBotService } from '../../services/smart-bot.service';

// @Component({
//   selector: 'app-login',
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.scss']
// })
// export class LoginComponent implements OnInit {

//   constructor(
//       private gmailService: GmailService, 
//       private router: Router,
//       private smartBot: SmartBotService
//   ) {}
//   ngOnInit(): void {
//     google.accounts.id.initialize({
//       client_id: '61178546523-sf6cpcn5bhgjl2bnoascmk8fiqn4bvv4.apps.googleusercontent.com',  // <-- replace this
//       callback: (response: any) => this.handleCredentialResponse(response),
//     });

//     google.accounts.id.renderButton(
//       document.getElementById('google-signin-btn'),
//       { theme: 'outline', size: 'large' }
//     );
//   }

//   handleCredentialResponse(response: any): void {
//     console.log('JWT Token from Google:', response.credential);
//     this.gmailService.authenticate()
//     .then(() => {
//       this.router.navigate(['/inbox']);
//       this.smartBot.processLatestEmailAndRespond();
//     })
//     .catch(err => {
//       console.error('❌ Gmail Auth Error:', err);
//     });
//   }

// }

//deepseek
// import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
// import { GmailService } from '../../services/gmail.service';
// declare const google: any;
// import { SmartBotService } from '../../services/smart-bot.service';

// @Component({
//   selector: 'app-login',
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.scss']
// })
// export class LoginComponent implements OnInit {
  
//   particles = Array(30).fill(0);

//   constructor(
//     private gmailService: GmailService, 
//     private router: Router,
//     private smartBot: SmartBotService
//   ) {}

//   ngOnInit(): void {
//     this.initializeGoogleSignIn();
//   }

//   private initializeGoogleSignIn(): void {
//     google.accounts.id.initialize({
//       client_id: '61178546523-sf6cpcn5bhgjl2bnoascmk8fiqn4bvv4.apps.googleusercontent.com',
//       callback: (response: any) => this.handleCredentialResponse(response),
//     });

//     google.accounts.id.renderButton(
//       document.getElementById('google-signin-btn'),
//       { 
//         theme: 'outline', 
//         size: 'large',
//         width: '400', 
//         text: 'continue_with', 
//         shape: 'pill', 
//         logo_alignment: 'center' 
//       }
//     );

    
//     google.accounts.id.prompt();
//   }

//   async handleCredentialResponse(response: any): Promise<void> {
//     console.log('JWT Token from Google:', response.credential);
//     try {
//       await this.gmailService.authenticate();
//       this.router.navigate(['/inbox']);
//       this.smartBot.processLatestEmailAndRespond();
//     } catch (err) {
//       console.error('❌ Gmail Auth Error:', err);
      
//     }
//   }
// }



import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GmailService } from '../../services/gmail.service';
import { SmartBotService } from '../../services/smart-bot.service';
import { CommonModule } from '@angular/common';

// Declare global 'google' variable from Google Sign-In API
declare const google: any;

@Component({
  selector: 'app-login',
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  // Particle array for animation in login.component.html
  particles = Array(30).fill(0); // You can change 30 to any number you want

  constructor(
    private gmailService: GmailService, 
    private router: Router,
    private smartBot: SmartBotService
  ) {}

  ngOnInit(): void {
    this.initializeGoogleSignIn();
  }

  // Google Sign-In Initialization
  private initializeGoogleSignIn(): void {
    google.accounts.id.initialize({
      client_id: '61178546523-sf6cpcn5bhgjl2bnoascmk8fiqn4bvv4.apps.googleusercontent.com',
      callback: (response: any) => this.handleCredentialResponse(response),
    });

    google.accounts.id.renderButton(
      document.getElementById('google-signin-btn'),
      { 
        theme: 'outline', 
        size: 'large',
        width: '400', 
        text: 'continue_with', 
        shape: 'pill', 
        logo_alignment: 'center' 
      }
    );

    google.accounts.id.prompt(); // Optional: Shows One Tap prompt
  }

  // Handles the Google Sign-In JWT response
  async handleCredentialResponse(response: any): Promise<void> {
    console.log('✅ JWT Token from Google:', response.credential);
    try {
      await this.gmailService.authenticate();
      this.router.navigate(['/inbox']);
      this.smartBot.processLatestEmailAndRespond();
    } catch (err) {
      console.error('❌ Gmail Auth Error:', err);
    }
  }
}


