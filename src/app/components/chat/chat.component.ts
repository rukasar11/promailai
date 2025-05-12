import { Component,OnInit } from '@angular/core';
import { SmartBotService } from '../../services/smart-bot.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit  {
  messages: { sender: string; text: string }[] = [];
  messageText: string = '';
  username: string = 'You';
  newMessage = '';

  constructor(private smartBot: SmartBotService) {}

  ngOnInit(): void {
    // Show welcome message when chat opens
    this.messages.push({
      sender: 'SmartBot 🤖',
      text: `👋 Hello! I’m your Smart Gmail Assistant.<br><br>
              How can I assist you today?<br><br>
              <strong>Try commands like:</strong><br>
              • <code>/check-mail</code> – Check your latest unread email<br>
              • <code>/auto-reply</code> – Send a quick auto-response<br>
              • <code>/delete-latest</code> – Delete the most recent email<br>
              • <code>/archive-latest</code> – Archive your latest message<br>
              • <code>/latest-subject</code> – View the subject of your most recent email<br>
              • <code>/summarize</code> – Extract summary of latest email<br>
              • <code>/summarize-subject 'Email Subject'</code> – Extract summary of Email Subject You mentioned<br>
              • <code>/auto-reply-subject 'Email Subject'</code> – Auto-reply to email based on subject`
    });
  }
  
  // async send() {
  //   const text = this.messageText.trim();
  //   if (!text) return;
  
  //   this.messages.push({ sender: this.username, text });
  
  //   let botReply = '';
  
  //   switch (text.toLowerCase()) {
  //     case '/check-mail':
  //       botReply = '🔍 Checking your latest email...';
  //       this.messages.push({ sender: 'SmartBot 🤖', text: botReply });
  //       botReply = await this.smartBot.analyzeLatestEmail();
  //       break;
  //     case '/auto-reply':
  //       botReply = await this.smartBot.autoReply();
  //       break;
  //     case '/delete-latest':
  //       botReply = await this.smartBot.deleteLatest();
  //       break;
  //     case '/archive-latest':
  //       botReply = await this.smartBot.archiveLatest();
  //       break;
  //     case '/latest-subject':
  //       botReply = await this.smartBot.getLatestSubject();
  //       break;
  //     case '/summarize':
  //       botReply = '🧠 Summarizing the latest email...';
  //       this.messages.push({ sender: 'SmartBot 🤖', text: botReply });
  //       botReply = await this.smartBot.summarizeLatestEmail();
  //       break;
  //     case text.toLowerCase().startsWith('/summarize-subject'):
  //       const subjectQuery = text.substring('/summarize-subject'.length).trim();
  //       if (!subjectQuery) {
  //         botReply = '❗ Please provide a subject. Usage: /summarize-subject Your Subject Here';
  //       } else {
  //         botReply = `🔎 Searching for: "${subjectQuery}"`;
  //         this.messages.push({ sender: 'SmartBot 🤖', text: botReply });
  //         botReply = await this.smartBot.summarizeEmailBySubject(subjectQuery);
  //       }
  //       break;
  //     default:
  //       botReply = '🤖 Unknown command. Try: /check-mail, /auto-reply, /delete-latest, /archive-latest, /latest-subject';
  //   }
  
  //   this.messages.push({ sender: 'SmartBot 🤖', text: botReply });
  //   this.messageText = '';
  // }

  async send() {
    const text = this.messageText.trim();
    if (!text) return;
  
    this.messages.push({ sender: this.username, text });
  
    let botReply = '';
  
    if (text.toLowerCase() === '/check-mail') {
      botReply = '🔍 Checking your latest email...';
      this.messages.push({ sender: 'SmartBot 🤖', text: botReply });
      botReply = await this.smartBot.analyzeLatestEmail();
    } else if (text.toLowerCase() === '/auto-reply') {
      botReply = await this.smartBot.autoReply();
    } else if (text.toLowerCase() === '/delete-latest') {
      botReply = await this.smartBot.deleteLatest();
    } else if (text.toLowerCase() === '/archive-latest') {
      botReply = await this.smartBot.archiveLatest();
    } else if (text.toLowerCase() === '/latest-subject') {
      botReply = await this.smartBot.getLatestSubject();
    } else if (text.toLowerCase() === '/summarize') {
      botReply = '🧠 Summarizing the latest email...';
      this.messages.push({ sender: 'SmartBot 🤖', text: botReply });
      botReply = await this.smartBot.summarizeLatestEmail();
    } else if (text.toLowerCase().startsWith('/summarize-subject')) {
      const subjectQuery = text.substring('/summarize-subject'.length).trim();
      if (!subjectQuery) {
        botReply = '❗ Please provide a subject. Usage: /summarize-subject Your Subject Here';
      } else {
        botReply = `🔎 Searching for: "${subjectQuery}"`;
        this.messages.push({ sender: 'SmartBot 🤖', text: botReply });
        botReply = await this.smartBot.summarizeEmailBySubject(subjectQuery);
      }
    } else if (text.toLowerCase().startsWith('/auto-reply-subject')) {
      const subjectQuery = text.substring('/auto-reply-subject'.length).trim();
      if (!subjectQuery) {
        botReply = '❗ Please provide a subject. Usage: /auto-reply-subject Your Subject Here';
      } else {
        botReply = `✉️ Generating reply for: "${subjectQuery}"`;
        this.messages.push({ sender: 'SmartBot 🤖', text: botReply });
        botReply = await this.smartBot.autoReplyBySubject(subjectQuery);
      }
    } else {
      botReply = '🤖 Unknown command. Try: /check-mail, /auto-reply, /delete-latest, /archive-latest, /latest-subject, /summarize, /summarize-subject';
    }
  
    this.messages.push({ sender: 'SmartBot 🤖', text: botReply });
    this.messageText = '';
  }
  
}
