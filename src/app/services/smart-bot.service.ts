import { Injectable } from '@angular/core';
import { GmailService } from './gmail.service';

@Injectable({ providedIn: 'root' })
export class SmartBotService {
  private latestEmailId: string | null = null;

  constructor(private gmailService: GmailService) {}

  async analyzeLatestEmail(): Promise<string> {
    if (!this.gmailService.isSignedIn()) return '🔒 Please log in to check your Gmail.';

    const { subject, snippet, id } = await this.gmailService.getLatestEmailWithId();
    if (!snippet) return '📭 No new emails found.';

    this.latestEmailId = id;
    const content = snippet.toLowerCase();

    if (content.includes('meeting')) {
      return `📅 You have a meeting related email: "${subject}". Do you want to schedule it?`;
    }
    if (content.includes('invoice')) {
      return `💼 Found an invoice: "${subject}". Do you want to save it?`;
    }
    return `📬 New email: "${subject}". Reply / Delete / Archive / Translate?`;
  }

  async autoReply(): Promise<string> {
    if (!this.latestEmailId) return '❗ No email loaded. Use /check-mail first.';

    const latestMsg = await this.gmailService.getMessage(this.latestEmailId);
    const fromHeader = latestMsg.payload.headers.find((h: any) => h.name === 'From');
    const toEmail = fromHeader?.value?.match(/<(.*)>/)?.[1] || fromHeader?.value;
  
    if (!toEmail) return '❗ Could not find the sender’s email address.';
  
    await this.gmailService.sendEmail(
      toEmail,
      'Re: Automated Reply',
      'Hi there! Just a quick note to let you know I’ll get back to you shortly. Thanks for your email!'
    );
  
    return '📤 Auto-reply sent successfully.';
  }

  async deleteLatest(): Promise<string> {
    if (!this.latestEmailId) return '❗ No email to delete. Run /check-mail first.';
    await this.gmailService.deleteMessage(this.latestEmailId);
    return '🗑️ Email moved to trash.';
  }

  async archiveLatest(): Promise<string> {
    if (!this.latestEmailId) return '❗ No email to archive. Run /check-mail first.';
    await this.gmailService.archiveMessage(this.latestEmailId);
    return '📥 Email archived.';
  }

  async getLatestSubject(): Promise<string> {
    const { subject } = await this.gmailService.getLatestEmailWithId();
    return `🧾 Latest email subject: "${subject}"`;
  }
  
  async processLatestEmailAndRespond(): Promise<void> {
    const response = await this.analyzeLatestEmail();
    console.log('SmartBot Response:', response);
    // You can send it to Firestore, or emit it through BehaviorSubject if needed
  }
}
