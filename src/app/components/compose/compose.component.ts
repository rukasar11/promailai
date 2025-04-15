import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GmailService } from '../../services/gmail.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-compose',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './compose.component.html',
  styleUrls: ['./compose.component.scss']
})
export class ComposeComponent {
  to = '';
  subject = '';
  body = '';

  constructor(
    public dialogRef: MatDialogRef<ComposeComponent>,
    private gmailService: GmailService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  async sendEmail() {
    await this.gmailService.sendEmail(this.to, this.subject, this.body);
    this.dialogRef.close();
  }
}
