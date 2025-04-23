//original

// import { Component, Inject } from '@angular/core';
// import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
// import { GmailService } from '../../services/gmail.service';
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-compose',
//   standalone: true,
//   imports: [FormsModule],
//   templateUrl: './compose.component.html',
//   styleUrls: ['./compose.component.scss']
// })
// export class ComposeComponent {
//   to = '';
//   subject = '';
//   body = '';

//   constructor(
//     public dialogRef: MatDialogRef<ComposeComponent>,
//     private gmailService: GmailService,
//     @Inject(MAT_DIALOG_DATA) public data: any
//   ) {}

//   async sendEmail() {
//     await this.gmailService.sendEmail(this.to, this.subject, this.body);
//     this.dialogRef.close();
//   }
// }


//updated

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GmailService } from '../../services/gmail.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-compose',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './compose.component.html',
  styleUrls: ['./compose.component.scss']
})
export class ComposeComponent {
  to = '';
  subject = '';
  body = '';
  isSending = false;
  error: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<ComposeComponent>,
    private gmailService: GmailService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Pre-fill fields if data is passed
    if (data) {
      this.to = data.to || '';
      this.subject = data.subject || '';
      this.body = data.body || '';
    }
  }

  async sendEmail() {
    if (!this.to) {
      this.error = 'Recipient email is required';
      return;
    }

    this.isSending = true;
    this.error = null;

    try {
      await this.gmailService.sendEmail(this.to, this.subject, this.body);
      this.dialogRef.close({ success: true });
    } catch (err) {
      console.error('Error sending email:', err);
      this.error = 'Failed to send email. Please try again.';
    } finally {
      this.isSending = false;
    }
  }

  discardDraft() {
    if (this.to || this.subject || this.body) {
      if (confirm('Are you sure you want to discard this draft?')) {
        this.dialogRef.close();
      }
    } else {
      this.dialogRef.close();
    }
  }

  closeCompose() {
    this.discardDraft();
  }
}