import { Component, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatTable, MatTableModule } from '@angular/material/table';
import { PeriodicElementService, PeriodicElement } from './periodic-element.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { EditDialogComponent } from './edit-dialog/edit-dialog.component';
import { debounceTime, map, Observable, Subject, switchMap } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RxState } from '@rx-angular/state'

interface State {
    elements: PeriodicElement[];
    filterValue: string;
}

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
    providers: [RxState],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
    title = 'test-task';
    displayedColumns: string[] = ['position', 'name', 'weight', 'symbol', 'actions'];

    originalDataSource$!: Observable<PeriodicElement[]>;
    filterValue$!: Observable<string>;


    @ViewChild(MatTable) table!: MatTable<PeriodicElement>;

    constructor(private _state: RxState<State>, private elementService: PeriodicElementService, public dialog: MatDialog) {
        this._state.set({ elements: [], filterValue: "" });
        this._state.connect('elements', this.elementService.fetchElements());

        this.originalDataSource$ = this._state.select('elements');
        this.filterValue$ = this._state.select('filterValue');
    }

    onFilterInput(event: Event) {
        const input = event.target as HTMLInputElement;
        const filterValue = input.value.trim().toLowerCase();

        this._state.set({ filterValue });

        this.originalDataSource$ = this._state.select('filterValue').pipe(
            debounceTime(2000),
            switchMap(filterValue =>
                this._state.select('elements').pipe(
                    map(elements => elements.filter(e =>
                        e.name.toLowerCase().includes(filterValue.toLowerCase()) ||
                        e.symbol.toLowerCase().includes(filterValue.toLowerCase()) ||
                        e.weight.toString().includes(filterValue) ||
                        e.position.toString().includes(filterValue)
                    ))
                )
            )
        );
    }

    openEditDialog(element: PeriodicElement): void {
        const dialogRef = this.dialog.open(EditDialogComponent, {
            width: '250px',
            data: { ...element }
        });


        this.originalDataSource$ = dialogRef.afterClosed().pipe(
            switchMap(result => {
                if (!result) {
                    return this._state.select('elements');
                }

                return this._state.select('elements').pipe(
                    map(elements => elements.map(e => e.position === result.position ? result : e))
                );
            })
        );
    }
}
