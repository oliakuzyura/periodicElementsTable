import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { PeriodicElement } from '../periodic-element.service';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
    selector: 'app-edit-dialog',
    standalone: true,
    imports: [MatDialogModule, FormsModule, MatFormFieldModule],
    templateUrl: './edit-dialog.component.html',
    styleUrl: './edit-dialog.component.css'
})
export class EditDialogComponent {
    constructor(public dialogRef: MatDialogRef<EditDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: PeriodicElement
    ) { }

    onNoClick() {
        this.dialogRef.close();
    }

    onSave() {
        this.dialogRef.close(this.data);
    }
}
