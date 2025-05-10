import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auto-reply-scheduler',
  template: `
    <h2>Auto-Reply Scheduler</h2>
    <form (ngSubmit)="save()">
      <label>
        Start Time:
        <input type="datetime-local" [(ngModel)]="data.startTime" name="startTime" required />
      </label><br />
      <label>
        End Time:
        <input type="datetime-local" [(ngModel)]="data.endTime" name="endTime" required />
      </label><br />
      <label>
        Auto-Reply Message:
        <textarea [(ngModel)]="data.message" name="message" rows="4" required></textarea>
      </label><br />
      <button type="submit">Save</button>
      <button type="button" (click)="dialogRef.close()">Cancel</button>
    </form>
  `,
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AutoReplySchedulerComponent {
  constructor(
    public dialogRef: MatDialogRef<AutoReplySchedulerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { startTime: string; endTime: string; message: string }
  ) {}

  save() {
    this.dialogRef.close(this.data);
  }
}
