import { Component, OnInit } from '@angular/core';
import { GmailService } from '../../services/gmail.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Add to `imports` array
import { MatDialog } from '@angular/material/dialog';
import { ComposeComponent } from '../compose/compose.component';
import { RouterModule } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent implements OnInit {
  messages: any[] = [];
  selectedMessage: any = null;
  currentTab: string = 'CATEGORY_PRIMARY';
  composeMode = false;
  nextPageToken: string | null = null;
  previousPageTokens: string[] = [];
  pageIndex = 0;
  
  composeData = {
    to: '',
    subject: '',
    body: ''
  };
  
  constructor(private gmailService: GmailService,
    private dialog: MatDialog,
    private chatService: ChatService
  ) {}

  async ngOnInit() {
    console.log('📛 Current Token:', this.gmailService['accessToken']);

    this.chatService.chatPopup$.subscribe(show => {
      if (show) {
        this.dialog.open(ChatComponent, {
          width: '400px',
          height: '500px'
        });
      }
    });
    if (this.gmailService.isSignedIn()) {
      await this.gmailService.initClient();
      await this.loadMessages(this.currentTab);
    } else {
      console.warn('User not authenticated yet. Waiting for token...');
      // Optionally redirect to login
    }
  }

  openCompose() {
    this.dialog.open(ComposeComponent, {
      width: '600px',
      data: {}
    });
  }
  
  openChat() {
    this.dialog.open(ChatComponent, {
      width: '400px',
      height: '500px'
    });
  }
  
  async loadMessages(label: string,pageToken: string | null = null) {
    if (label !== this.currentTab) {
      this.previousPageTokens = [];
    }

    this.messages = [];
    this.selectedMessage = null;
    this.currentTab = label;

    try {
      console.log('label',label);
      const list = await this.gmailService.listMessages(label,pageToken || '')
        .catch(err => {
          console.error('❌ Error fetching messages:', err);
          return { messages: [], nextPageToken: undefined };
        });

      this.nextPageToken = list.nextPageToken || null;

      if (pageToken && !this.previousPageTokens.includes(pageToken)) {
        this.previousPageTokens.push(pageToken);
        this.pageIndex++;
      } else {
        this.pageIndex = 0;
      }

      for (let msg of list.messages) {
        const fullMessage = await this.gmailService.getMessage(msg.id)
          .catch(err => {
            console.error(`❌ Error fetching message ${msg.id}:`, err);
            return null;
          });

        if (fullMessage) {
          this.messages.push(fullMessage);
        }
      }
    } catch (err) {
      console.error('❌ Unexpected error loading messages:', err);
    }
  }

  getSubject(message: any): string {
    const headers = message.payload?.headers || [];
    const subjectHeader = headers.find((h: any) => h.name === 'Subject');
    return subjectHeader?.value || '(No Subject)';
  }

  getFrom(message: any): string {
    const headers = message.payload?.headers || [];
    const fromHeader = headers.find((h: any) => h.name === 'From');
    return fromHeader?.value || '(Unknown Sender)';
  }

  getSnippet(message: any): string {
    return message.snippet || '';
  }

  selectMessage(message: any) {
    this.selectedMessage = message;
  }
  
  getBody(message: any): string {
    function findHtmlPart(parts: any[]): string | null {
      for (const part of parts) {
        if (part.mimeType === 'text/html' && part.body?.data) {
          return part.body.data;
        } else if (part.parts) {
          const nested = findHtmlPart(part.parts);
          if (nested) return nested;
        }
      }
      return null;
    }
  
    let bodyData: string | null = null;
  
    // Check direct body
    if (message.payload?.body?.data) {
      bodyData = message.payload.body.data;
    }
    // Otherwise, try to find 'text/html' part
    else if (message.payload?.parts?.length) {
      bodyData = findHtmlPart(message.payload.parts);
    }
  
    if (!bodyData) return '(No Content)';
  
    // Decode from base64url
    try {
      return atob(bodyData.replace(/-/g, '+').replace(/_/g, '/'));
    } catch (e) {
      console.error('❌ Error decoding body', e);
      return '(Unable to decode message body)';
    }
  }
  

  logout() {
    this.gmailService.signOut();
    window.location.href = '/'; // or use this.router.navigate(['/']);
  }
  
  async sendMail(event: Event) {
    event.preventDefault();
    const { to, subject, body } = this.composeData;
  
    try {
      await this.gmailService.sendEmail(to, subject, body);
      alert('✅ Email sent!');
      this.composeMode = false;
      this.composeData = { to: '', subject: '', body: '' };
    } catch (err) {
      console.error('❌ Send Mail Error:', err);
      alert('Failed to send email.');
    }
  }
  
  replyToMessage() {
    const headers = this.selectedMessage.payload.headers;
    const from = headers.find((h: any) => h.name === 'From')?.value;
    const subject = 'Re: ' + this.getSubject(this.selectedMessage);
    const body = '\n\n---Original Message---\n' + this.getBody(this.selectedMessage);
    
    this.dialog.open(ComposeComponent, {
      width: '600px',
      data: { to: from, subject, body }
    });
  }

  async deleteMessage() {
    if (this.selectedMessage) {
      await this.gmailService.deleteMessage(this.selectedMessage.id);
      await this.loadMessages(this.currentTab);
    }
  }
  
  async archiveMessage() {
    if (this.selectedMessage) {
      await this.gmailService.archiveMessage(this.selectedMessage.id);
      await this.loadMessages(this.currentTab);
    }
  }

  async loadNextPage() {
    if (this.nextPageToken) {
      await this.loadMessages(this.currentTab, this.nextPageToken);
    }
  }
  
  async loadPreviousPage() {
    console.log('this.previousPageTokens.length',this.previousPageTokens.length);
    if (this.previousPageTokens.length >= 1) {
      // Pop current token and go to the one before it
      this.previousPageTokens.pop(); 
      const prevToken = this.previousPageTokens.pop() || null;
      await this.loadMessages(this.currentTab, prevToken);
    }
  }
    

}
