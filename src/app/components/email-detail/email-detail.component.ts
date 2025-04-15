import { Component,OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GmailService } from '../../services/gmail.service';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-email-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './email-detail.component.html',
  styleUrl: './email-detail.component.scss'
})
export class EmailDetailComponent implements OnInit  {
  message: any = null;
  messageId: string = '';
  originalBody !: SafeHtml;
  rawBody: string = '';
  translatedBody: string | null = null;
  translating = false;
  constructor(
    private route: ActivatedRoute,
    private gmailService: GmailService,
    private translationService: TranslationService,
    private sanitizer: DomSanitizer 
  ) {}

  async ngOnInit() {
    this.messageId = this.route.snapshot.paramMap.get('id') || '';
    if (this.messageId) {
      this.message = await this.gmailService.getMessage(this.messageId);
      const decoded = this.extractAndDecodeBody(this.message);
      this.rawBody = decoded;
      this.originalBody = this.sanitizer.bypassSecurityTrustHtml(decoded);
    }
  }

  getSubject(): string {
    const headers = this.message?.payload?.headers || [];
    const subjectHeader = headers.find((h: any) => h.name === 'Subject');
    return subjectHeader?.value || '(No Subject)';
  }

  getFrom(): string {
    const headers = this.message?.payload?.headers || [];
    const fromHeader = headers.find((h: any) => h.name === 'From');
    return fromHeader?.value || '(Unknown Sender)';
  }

  getBody(): SafeHtml {
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

    if (this.message.payload?.body?.data) {
      bodyData = this.message.payload.body.data;
    } else if (this.message.payload?.parts?.length) {
      bodyData = findHtmlPart(this.message.payload.parts);
    }

    if (!bodyData) return '(No Content)';

    // try {
    //   return atob(bodyData.replace(/-/g, '+').replace(/_/g, '/'));
    // } catch (e) {
    //   console.error('❌ Error decoding body', e);
    //   return '(Unable to decode message body)';
    // }
    try {
      // const decoded = atob(bodyData.replace(/-/g, '+').replace(/_/g, '/'));
      const decoded = this.decodeBase64UrlUtf8(bodyData);
      return this.sanitizer.bypassSecurityTrustHtml(decoded);
    } catch (e) {
      console.error('❌ Error decoding body', e);
      return this.sanitizer.bypassSecurityTrustHtml('(Unable to decode message body)');
    }
  }

  decodeBase64UrlUtf8(data: string): string {
    // Convert Base64URL to standard Base64
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    const decoded = new TextDecoder('utf-8').decode(bytes);
    return decoded;
  }
  
  async translateEmail() {
    this.translating = true;
    this.translatedBody = null;
  
    this.originalBody = this.getBody();

    try {
      const detectRes: any = await this.translationService.detectLanguage(this.rawBody).toPromise();
      const detectedLang = detectRes[0]?.language || 'auto';
  
      if (detectedLang === 'en') {
        this.translatedBody = 'This email is already in English.';
      } else {
        const translateRes: any = await this.translationService.translateToEnglish(this.rawBody, detectedLang).toPromise();
        this.translatedBody = translateRes.translatedText;
      }
    } catch (error) {
      console.error('Translation error:', error);
      this.translatedBody = '(Translation failed)';
    }
  
    this.translating = false;
  }

  private extractAndDecodeBody(message: any): string {
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
    } else if (message.payload?.parts?.length) {
      bodyData = findHtmlPart(message.payload.parts);
    }
  
    if (!bodyData) return '(No Content)';
  
    try {
      return this.decodeBase64UrlUtf8(bodyData);
      // return atob(bodyData.replace(/-/g, '+').replace(/_/g, '/'));
    } catch (e) {
      console.error('❌ Error decoding body', e);
      return '(Unable to decode message body)';
    }
  }
  
}
