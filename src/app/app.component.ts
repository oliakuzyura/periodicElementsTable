import { Component, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatTable, MatTableModule } from '@angular/material/table';
import { PeriodicElementService, PeriodicElement } from './periodic-element.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { EditDialogComponent } from './edit-dialog/edit-dialog.component';
import { debounceTime, Subject } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        RouterOutlet,
        MatTableModule,
        MatDialogModule,
        MatInputModule,
        FormsModule,
        MatTable,
        MatFormFieldModule
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
    title = 'test-task';
    displayedColumns: string[] = ['position', 'name', 'weight', 'symbol', 'actions'];
    dataSource: PeriodicElement[] = [];

    private originalDataSource: PeriodicElement[] = [];
    private filterSubject = new Subject<string>();

    @ViewChild(MatTable) table!: MatTable<PeriodicElement>;

    constructor(private elementService: PeriodicElementService, public dialog: MatDialog) { }

    ngOnInit() {
        this.elementService.fetchElements().subscribe((data) => {
            this.originalDataSource = data;
            this.dataSource = [...this.originalDataSource];
        });

        this.filterSubject.pipe(
            debounceTime(200)
        ).subscribe(filterValue => {
            this.applyFilter(filterValue);
        })
    }

    applyFilter(filterValue: string): void {
        if (filterValue.trim() === '') 
            this.dataSource = [...this.originalDataSource];
        else {
            const filteredValue = filterValue.trim().toLowerCase();

            this.dataSource = this.dataSource.filter(e =>
                e.name.toLowerCase().includes(filteredValue) ||
                e.symbol.toLowerCase().includes(filteredValue) ||
                e.weight.toString().includes(filteredValue) ||
                e.position.toString().includes(filteredValue)
            );
        }

        if (this.table)
            this.table.renderRows();
    }

    onFilterInput(event: Event) {
        const input = event.target as HTMLInputElement;
        const filterValue = input.value;

        this.filterSubject.next(filterValue);
    }

    openEditDialog(element: PeriodicElement): void {
        const dialogRef = this.dialog.open(EditDialogComponent, {
            width: '250px',
            data: { ...element }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const index = this.dataSource.findIndex(e => e.position === result.position);
                if (index !== -1) {
                    this.dataSource[index] = result;
                }

                if (this.table) {
                    this.table.renderRows();
                }
            }
        });

    }
}
