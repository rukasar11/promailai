// import { Component, Inject } from '@angular/core';
// import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-auto-reply-scheduler',
//   template: `
//     <h2>Auto-Reply Scheduler</h2>
//     <form (ngSubmit)="save()">
//       <label>
//         Start Time:
//         <input type="datetime-local" [(ngModel)]="data.startTime" name="startTime" required />
//       </label><br />
//       <label>
//         End Time:
//         <input type="datetime-local" [(ngModel)]="data.endTime" name="endTime" required />
//       </label><br />
//       <label>
//         Auto-Reply Message:
//         <textarea [(ngModel)]="data.message" name="message" rows="4" required></textarea>
//       </label><br />
//       <button type="submit">Save</button>
//       <button type="button" (click)="dialogRef.close()">Cancel</button>
//     </form>
//   `,
//   standalone: true,
//   imports: [CommonModule, FormsModule],
// })
// export class AutoReplySchedulerComponent {
//   constructor(
//     public dialogRef: MatDialogRef<AutoReplySchedulerComponent>,
//     @Inject(MAT_DIALOG_DATA) public data: { startTime: string; endTime: string; message: string }
//   ) {}

//   save() {
//     this.dialogRef.close(this.data);
//   }
// }


//Updated
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-auto-reply-scheduler',
  template: `
    <mat-card class="scheduler-card">
      <button mat-icon-button class="close-button" (click)="dialogRef.close()" aria-label="Close dialog">
        <mat-icon>close</mat-icon>
      </button>

      <h2 class="title">Auto-Reply Scheduler</h2>
      <form (ngSubmit)="save()" class="scheduler-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Start Time</mat-label>
          <input matInput type="datetime-local" [(ngModel)]="data.startTime" name="startTime" required />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>End Time</mat-label>
          <input matInput type="datetime-local" [(ngModel)]="data.endTime" name="endTime" required />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Auto-Reply Message</mat-label>
          <textarea matInput [(ngModel)]="data.message" name="message" rows="4" required></textarea>
        </mat-form-field>

        <div class="button-group">
          <button mat-flat-button color="primary" type="submit">Save</button>
          <button mat-button type="button" (click)="dialogRef.close()">Cancel</button>
        </div>
      </form>
    </mat-card>
  `,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  styles: [`
    .scheduler-card {
      max-width: 500px;
      margin: 20px auto;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      position: relative;
    }

    .title {
      text-align: center;
      margin-bottom: 20px;
      font-weight: 500;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .button-group {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 16px;
    }

    .close-button {
      position: absolute;
      top: 12px;
      right: 12px;
      color: #555;
    }

    .close-button:hover {
      color: #000;
    }
  `]
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
