import { Component, OnInit } from '@angular/core';
import { GmailService } from '../../services/gmail.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ComposeComponent } from '../compose/compose.component';
import { RouterModule } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { ChatComponent } from '../chat/chat.component';
import { TranslationService } from '../../services/translation.service';
import { AutoReplySchedulerComponent } from '../auto-reply-scheduler/auto-reply-scheduler.component';
interface EmailMessage {
  id: string;
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body?: { data?: string };
    parts?: any[];
  };
  isRead?: boolean;
}

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent implements OnInit {
  messages: EmailMessage[] = [];
  selectedMessage: EmailMessage | null = null;
  currentTab: string = 'CATEGORY_PRIMARY';
  composeMode = false;
  nextPageToken: string | null = null;
  previousPageTokens: string[] = [];
  pageIndex = 0;
  translating: boolean = false;
  translatedBody: string = '';
  translateLanguage: string = 'EN';
  autoReplyEnabled: boolean = false;
  languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ar', name: 'Arabic' },
    { code: 'zh', name: 'Chinese (Simplified)' },
    { code: 'zh-TW', name: 'Chinese (Traditional)' },
    { code: 'ru', name: 'Russian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'it', name: 'Italian' },
    { code: 'nl', name: 'Dutch' },
    { code: 'tr', name: 'Turkish' },
    { code: 'pl', name: 'Polish' },
    { code: 'sv', name: 'Swedish' },
    { code: 'fi', name: 'Finnish' },
    { code: 'no', name: 'Norwegian' },
    { code: 'da', name: 'Danish' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'he', name: 'Hebrew' },
    { code: 'id', name: 'Indonesian' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'th', name: 'Thai' }
  ];  
  searchQuery: string = '';
  selectedLanguage = 'en';
  composeData = {
    to: '',
    subject: '',
    body: ''
  };
  
  constructor(
    private gmailService: GmailService,
    private dialog: MatDialog,
    private chatService: ChatService,
    private translationService: TranslationService
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
      setInterval(() => {
        this.autoReplyToNewEmails();
      }, 60 * 1000);
    } else {
      console.warn('User not authenticated yet. Waiting for token...');
    }

    const savedAutoReplyStatus = localStorage.getItem('autoReplyEnabled');
    this.autoReplyEnabled = savedAutoReplyStatus === 'true';

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
  
  async loadMessages(label: string, pageToken: string | null = null) {
    if (label !== this.currentTab) {
      this.previousPageTokens = [];
    }

    this.messages = [];
    this.selectedMessage = null;
    this.translatedBody = '';
    this.currentTab = label;

    try {
      const list = await this.gmailService.listMessages(label, pageToken || '')
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
          // Initialize isRead property if it doesn't exist
          if (fullMessage.isRead === undefined) {
            fullMessage.isRead = false;
          }
          this.messages.push(fullMessage);
        }
      }
    } catch (err) {
      console.error('❌ Unexpected error loading messages:', err);
    }
  }

  markAsRead(message: EmailMessage): void {
    if (!message.isRead) {
      message.isRead = true;
      // Optional: Add API call here to update read status on server
      // this.gmailService.markAsRead(message.id).subscribe(...);
    }
    this.selectMessage(message);
  }

  getSubject(message: EmailMessage): string {
    const headers = message.payload?.headers || [];
    const subjectHeader = headers.find((h) => h.name === 'Subject');
    return subjectHeader?.value || '(No Subject)';
  }

  getFrom(message: EmailMessage): string {
    const headers = message.payload?.headers || [];
    const fromHeader = headers.find((h) => h.name === 'From');
    return fromHeader?.value || '(Unknown Sender)';
  }

  getDate(message: EmailMessage): Date {
    const headers = message.payload?.headers || [];
    const dateHeader = headers.find((h) => h.name === 'Date');
    return dateHeader?.value ? new Date(dateHeader.value) : new Date();
  }

  getSnippet(message: EmailMessage): string {
    return message.snippet || '';
  }

  // selectMessage(message: EmailMessage) {
  //   this.selectedMessage = message;
  //   this.translatedBody = '';
  // }
  
  getBody(message: EmailMessage): string {
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
  
    if (message.payload?.body?.data) {
      bodyData = message.payload.body.data;
    }
    else if (message.payload?.parts?.length) {
      bodyData = findHtmlPart(message.payload.parts);
    }
  
    if (!bodyData) return '(No Content)';
  
    try {
      return atob(bodyData.replace(/-/g, '+').replace(/_/g, '/'));
    } catch (e) {
      console.error('❌ Error decoding body', e);
      return '(Unable to decode message body)';
    }
  }

  selectMessage(message: any) {
    this.selectedMessage = message;
    // this.translateEmailContent(message);  // Translate when selecting a message
  }

  translateEmailContent(message: any = this.selectedMessage) {
    const body = this.getBody(message);
    console.log('body',body);
    const plainText = this.stripHtml(body); 
    console.log('plainText', plainText);
    console.log('this.selectedLanguage.toUpperCase()',this.selectedLanguage.toLowerCase());
    this.translating = true;
    // this.translationService.translate(plainText, this.selectedLanguage.toLowerCase()).subscribe({
    //   next: (response:any) => {
    //     console.log('response',response);
    //     const rawTranslatedText = response.translations[0].text || '(No translated text)';
    //     const cleanedText = this.cleanTranslatedText(rawTranslatedText);
    //     this.translatedBody =  cleanedText;
    //     console.log('this.translatedBody',this.translatedBody);
    //   },
    //   error: (err) => {
    //     console.error('❌ Translation Error:', err);
    //     this.translatedBody = '(Unable to translate message)';
    //     this.translating = false;
    //   }
    // });
    this.translationService.translate(plainText, this.selectedLanguage.toLowerCase()).subscribe({
      next: (response: any) => {
        const rawTranslatedText = response?.choices?.[0]?.message?.content || '(No translated text)';
        const cleanedText = this.cleanTranslatedText(rawTranslatedText);
        this.translatedBody = cleanedText;
        this.translating = false;
      },
      error: (err) => {
        console.error('❌ Translation Error:', err);
        this.translatedBody = '(Unable to translate message)';
        this.translating = false;
      }
    });    
  }

  // Helper method
  stripHtml(html: string): string {
    if (!html) return '';
  
    return html
      // Remove Word-style comments and definitions
      .replace(/<!--[\s\S]*?-->/gi, '') // remove HTML comments
      .replace(/<style[\s\S]*?<\/style>/gi, '') // remove style tags
      .replace(/<[^>]+>/g, '') // remove all HTML tags
      .replace(/\s+/g, ' ') // collapse whitespace
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .trim();
  }
  
  // stripHtml(html: string): string {
  //   const tempDiv = document.createElement('div');
  //   tempDiv.innerHTML = html;
  //   return tempDiv.textContent || tempDiv.innerText || '';
  // }


  cleanTranslatedText(raw: string): string {
    return raw
      // Remove HTML comments: <!-- ... -->
      .replace(/<!--[\s\S]*?-->/g, '')
      // Remove CSS/Word styles (font-face, .Mso*, etc.)
      .replace(/@font-face[\s\S]*?\}/g, '')
      .replace(/\.Mso[a-zA-Z]+[\s\S]*?\}/g, '')
      // Remove style definitions (e.g., span.EmailStyle17, p.MsoNormal, etc.)
      .replace(/p\.[^{]*\{[^}]*\}/g, '')
      .replace(/span\.[^{]*\{[^}]*\}/g, '')
      .replace(/div\.[^{]*\{[^}]*\}/g, '')
      // Strip excessive line breaks
      .replace(/\n{2,}/g, '\n')
      .trim();
  }  

  logout() {
    this.gmailService.signOut();
    window.location.href = '/';
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
    if (!this.selectedMessage) return;
    
    const headers = this.selectedMessage.payload.headers;
    const from = headers.find((h) => h.name === 'From')?.value;
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
      try {
        await this.gmailService.archiveMessage(this.selectedMessage.id);
        this.selectedMessage = null;
        await this.loadMessages(this.currentTab);
      } catch (error) {
        console.error('❌ Error archiving message:', error);
        alert('Failed to archive the message.');
      }
    }
  }

  async loadNextPage() {
    if (this.nextPageToken) {
      await this.loadMessages(this.currentTab, this.nextPageToken);
    }
  }
  
  async loadPreviousPage() {
    if (this.previousPageTokens.length >= 1) {
      this.previousPageTokens.pop(); 
      const prevToken = this.previousPageTokens.pop() || null;
      await this.loadMessages(this.currentTab, prevToken);
    }
  }

  async searchMail() {
    if (!this.searchQuery.trim()) return;
  
    try {
      const results = await this.gmailService.searchMessages(this.searchQuery);
      this.messages = await Promise.all(
        results.messages.map(msg => this.gmailService.getMessage(msg.id))
      );
      this.selectedMessage = null;
      this.translatedBody = '';
    } catch (error) {
      console.error('❌ Search error:', error);
      alert('Failed to search messages.');
    }
  }

  openAutoReplyScheduler() {
    const dialogRef = this.dialog.open(AutoReplySchedulerComponent, {
      width: '400px',
      data: { startTime: '', endTime: '', message: '' }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.gmailService.setAutoReplySchedule(result.startTime, result.endTime, result.message)
          .then(() => alert('✅ Auto-reply scheduled successfully.'))
          .catch(err => {
            console.error('❌ Error scheduling auto-reply:', err);
            alert('Failed to set auto-reply.');
          });
      }
    });
  }
  
  async autoReplyToNewEmails() {
    if (!this.autoReplyEnabled) return;

    const schedule = this.gmailService.getAutoReplySchedule();
    if (!schedule) return;
  
    const now = new Date();
    const start = new Date(schedule.startTime);
    const end = new Date(schedule.endTime);

    if (now < start || now > end) return;
  
    try {
      console.log('inside try');
      const unreadMessages = await this.gmailService.listMessages('INBOX', '', 'is:unread');
      console.log('unreadMessages',unreadMessages);
      if (!unreadMessages?.messages) return;
  
      for (const msg of unreadMessages.messages) {
        console.log('inside for');
        const fullMessage = await this.gmailService.getMessage(msg.id);
        const from = fullMessage.payload.headers.find((h: { name: string; value: string }) => h.name === 'From')?.value;
        const subject = 'Re: ' + (fullMessage.payload.headers.find((h: { name: string; value: string }) => h.name === 'Subject')?.value || '(No Subject)');
        const threadId = fullMessage.threadId;
  
        // Avoid replying to no-reply addresses
        if (from?.toLowerCase().includes('no-reply')) continue;
  
        // Avoid duplicate auto-replies (store replied thread IDs)
        const repliedThreads = JSON.parse(localStorage.getItem('repliedThreads') || '[]');
        if (repliedThreads.includes(threadId)) continue;
  
        // Send auto-reply
        await this.gmailService.sendEmail(from, subject, schedule.message, threadId);
  
        // Mark as replied
        repliedThreads.push(threadId);
        localStorage.setItem('repliedThreads', JSON.stringify(repliedThreads));
      }
    } catch (error) {
      console.error('❌ Auto-reply error:', error);
    }
  }

  enableAutoReply() {
    this.autoReplyEnabled = true;
    localStorage.setItem('autoReplyEnabled', 'true');
  }
  
  disableAutoReply() {
    this.autoReplyEnabled = false;
    localStorage.setItem('autoReplyEnabled', 'false');
  }
    
}