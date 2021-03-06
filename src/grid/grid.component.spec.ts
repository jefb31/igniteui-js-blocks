import { Component, ViewChild } from "@angular/core";
import { async, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FilteringCondition } from "../../src/data-operations/filtering-condition";
import { IDataState } from "../data-operations/data-state.interface";
import {
    CustomDateRangeFilteringStrategy,
    CustomJobTitleSortingStrategy,
    CustomStrategyData
} from "../grid/tests.helper";
import { IgxGridComponent, IgxGridModule, IgxGridRow } from "./grid.component";

describe("IgxGrid", () => {

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridMarkupDefinitionTestComponent,
                IgxGridngForDefinitionTestComponent,
                IgxGridTemplatedTestComponent,
                IgxGridWithAutogenerateTestComponent,
                IgxGridCustomSortingTestComponent,
                IgxGridCustomFilteringDateRange
            ],
            imports: [BrowserAnimationsModule, IgxGridModule]
        })
            .compileComponents();
    }));

    it("should initialize a grid with columns from markup", () => {
        const fixture = TestBed.createComponent(IgxGridMarkupDefinitionTestComponent);
        fixture.detectChanges();

        const testInstance = fixture.componentInstance;
        const grid = testInstance.grid;

        expect(testInstance).toBeDefined();
        expect(grid).toBeDefined("Markup grid is not created");

        fixture.detectChanges();

        expect(grid.columns.length).toEqual(2, "Grid columns do not match");
        expect(grid.columns[0].field).toMatch("ID");
        expect(grid.columns[1].field).toMatch("Name");
        expect(fixture.nativeElement.querySelectorAll("tr").length).toEqual(4, "Incorrect number of grid rows");
        expect(fixture.nativeElement.querySelectorAll("table > thead > tr").length)
            .toEqual(1, "Header row not rendered");
        expect(fixture.nativeElement.querySelectorAll("th").length).toEqual(2, "Columns not rendered correctly");
    });

    it("should initialize a grid with columns with ngFor expression", () => {
        const fixture = TestBed.createComponent(IgxGridngForDefinitionTestComponent);
        fixture.detectChanges();

        const testInstance = fixture.componentInstance;
        const grid = testInstance.grid;

        expect(testInstance).toBeDefined();
        expect(grid).toBeDefined("ngFor grid is not created");

        fixture.detectChanges();

        expect(grid.columns.length).toEqual(2, "Grid columns do not match");
        expect(grid.columns[0].field).toMatch("ID");
        expect(grid.columns[1].field).toMatch("Name");
        expect(fixture.nativeElement.querySelectorAll("tr").length).toEqual(4, "Incorrect number of grid rows");
        expect(fixture.nativeElement.querySelectorAll("table > thead > tr").length)
            .toEqual(1, "Header row not rendered");
        expect(fixture.nativeElement.querySelectorAll("th").length).toEqual(2, "Columns not rendered correctly");
    });

    it("should initialize a grid with autogenerated columns", () => {
        const fixture = TestBed.createComponent(IgxGridWithAutogenerateTestComponent);
        fixture.detectChanges();

        const testInstance = fixture.componentInstance;
        const grid = testInstance.grid;

        expect(testInstance).toBeDefined();
        expect(grid).toBeDefined();
        expect(grid.autoGenerate).toBe(true);

        expect(grid.columns.length).toEqual(2, "Grid columns do not match");
        expect(grid.columns[0].field).toMatch("ID");
        expect(grid.columns[1].field).toMatch("Name");
        expect(fixture.nativeElement.querySelectorAll("tr").length).toEqual(4, "Incorrect number of grid rows");
        expect(fixture.nativeElement.querySelectorAll("table > thead > tr").length)
            .toEqual(1, "Header row not rendered");
        expect(fixture.nativeElement.querySelectorAll("th").length).toEqual(2, "Columns not rendered correctly");
    });

    it("should support templating in header/cell rows", () => {
        const fixture = TestBed.createComponent(IgxGridTemplatedTestComponent);
        fixture.detectChanges();

        const testInstance = fixture.componentInstance;
        const grid = testInstance.grid;

        expect(testInstance).toBeDefined();
        expect(grid).toBeDefined("Templated grid not initialized");

        fixture.detectChanges();

        expect(grid.columns[0].bodyTemplate).toBeDefined("Column cell template not initialized");
        expect(grid.columns[0].headerTemplate).toBeDefined("Column header template not initialized");
        expect(fixture.nativeElement.querySelector("tr > td > span.mybodytemplate"))
            .toBeDefined("Cell template not rendered");
        expect(fixture.nativeElement.querySelector("tr > th > div.igx-grid__th-content"))
            .toBeDefined("Header template not rendered");
        expect(fixture.nativeElement.querySelector("tr > th > div.igx-grid__th-content").textContent)
            .toMatch("ID", "Header template is wrong");
        expect(fixture.nativeElement.querySelector("tr > td > span.mybodytemplate").textContent)
            .toMatch("1", "Cell template is wrong");
    });

    it("should have ARIA attributes set correctly", () => {
        const fixture = TestBed.createComponent(IgxGridMarkupDefinitionTestComponent);
        fixture.detectChanges();

        const nativeElement: HTMLElement = fixture.nativeElement.querySelector("table");
        const grid = fixture.componentInstance.grid;
        const thead = nativeElement.querySelector("thead");
        const tbody = nativeElement.querySelector("tbody");

        fixture.detectChanges();

        expect(nativeElement.getAttribute("role")).toMatch("grid");
        expect(nativeElement.getAttribute("aria-readonly")).toMatch("true");

        expect(thead.getAttribute("role")).toMatch("rowgroup");
        expect(thead.querySelector("tr").getAttribute("role")).toMatch("rowheader");

        expect(thead.querySelector("tr > th").getAttribute("role")).toMatch("columnheader");
        expect(tbody.querySelector("tr > td").getAttribute("role")).toMatch("gridcell");

        expect(tbody.querySelector("tr").getAttribute("role")).toMatch("row");
        expect(tbody.querySelector("tr").getAttribute("data-row")).toMatch("0");

        expect(tbody.querySelector("tr > td").getAttribute("aria-readonly")).toMatch("true");
        expect(tbody.querySelector("tr > td").getAttribute("aria-describedby")).toMatch("ID");

        expect(tbody.querySelector("tr > td").getAttribute("data-row")).toBe("0");
        expect(tbody.querySelector("tr > td").getAttribute("data-col")).toBe("0");

        // Make the first column editable
        grid.columns[0].editable = true;

        fixture.detectChanges();

        expect(nativeElement.getAttribute("aria-readonly")).toMatch("false");
        expect(tbody.querySelector("tr > td").getAttribute("aria-readonly")).toMatch("false");
    });

    it("should have the basic CRUD API working correctly", () => {
        const fixture = TestBed.createComponent(IgxGridMarkupDefinitionTestComponent);
        fixture.detectChanges();

        const gridElement: HTMLElement = fixture.nativeElement.querySelector("table");
        const grid = fixture.componentInstance.grid;
        const data = fixture.componentInstance.data;

        expect(grid.hasEditableColumns).toBe(false);
        expect(grid.hasSorting).toBe(false);
        expect(grid.hasFiltering).toBe(false);

        grid.columns[0].sortable = true;
        grid.columns[0].editable = true;
        grid.columns[0].filtering = true;

        fixture.detectChanges();

        expect(grid.hasEditableColumns).toBe(true);
        expect(grid.hasSorting).toBe(true);
        expect(grid.hasFiltering).toBe(true);

        // Column API
        expect(grid.getColumnByIndex(0)).toEqual(grid.columns[0]);
        expect(grid.getColumnByIndex(1000)).toBeFalsy();
        expect(grid.getColumnByField("ID")).toEqual(grid.columns[0]);
        expect(grid.getColumnByField("Not Here")).toBeFalsy();

        fixture.detectChanges();

        const newRow = { ID: 4, Name: "Test String" };

        // Row Adding
        grid.addRow(newRow);
        fixture.detectChanges();

        expect(data.length).toEqual(4, "New row added to data container");
        expect(gridElement.querySelectorAll("tbody > tr").length).toEqual(4, "New row is rendered in the grid");
        expect(gridElement.querySelector("tbody > tr:last-child > td:last-child").textContent).toMatch("Test String");

        // Row Deleting with numeric index
        grid.deleteRow(3);
        fixture.detectChanges();

        expect(data.length).toEqual(3, "Row removed from the data container");
        expect(gridElement.querySelectorAll("tbody > tr").length).toEqual(3, "Row is removed from the grid");
        expect(gridElement.querySelector("tbody > tr:last-child > td:last-child").textContent)
            .not.toMatch("Test String");

        grid.addRow(newRow);
        fixture.detectChanges();

        expect(data.length).toEqual(4, "New row added to data container");
        expect(gridElement.querySelectorAll("tbody > tr").length).toEqual(4, "New row is rendered in the grid");
        expect(gridElement.querySelector("tbody > tr:last-child > td:last-child").textContent).toMatch("Test String");

        // Row Deleting with string index
        grid.deleteRow("3");
        fixture.detectChanges();

        expect(data.length).toEqual(3, "Row removed from the data container");
        expect(gridElement.querySelectorAll("tbody > tr").length).toEqual(3, "Row is removed from the grid");
        expect(gridElement.querySelector("tbody > tr:last-child > td:last-child").textContent)
            .not.toMatch("Test String");

        grid.addRow(newRow);
        fixture.detectChanges();

        expect(data.length).toEqual(4, "New row added to data container");
        expect(gridElement.querySelectorAll("tbody > tr").length).toEqual(4, "New row is rendered in the grid");
        expect(gridElement.querySelector("tbody > tr:last-child > td:last-child").textContent).toMatch("Test String");

        // Row Deleting with row object
        grid.deleteRow(newRow);
        fixture.detectChanges();

        expect(data.length).toEqual(3, "Row removed from the datasource");
        expect(gridElement.querySelectorAll("tbody > tr").length).toEqual(3, "Row is removed from the grid");
        expect(gridElement.querySelector("tbody > tr:last-child > td:last-child").textContent)
            .not.toMatch("Test String");

        grid.addRow(newRow);
        fixture.detectChanges();

        expect(data.length).toEqual(4, "New row added to datasource");
        expect(gridElement.querySelectorAll("tbody > tr").length).toEqual(4, "New row is rendered in the grid");
        expect(gridElement.querySelector("tbody > tr:last-child > td:last-child").textContent).toMatch("Test String");

        // Row updating through API
        spyOn(grid.onEditDone, "emit");
        grid.updateRow(3, { ID: 10, Name: "New Value" });
        fixture.detectChanges();

        expect(grid.onEditDone.emit).toHaveBeenCalled();
        const lastRow = gridElement.querySelector("tbody > tr:last-child");

        expect(lastRow.querySelectorAll("td")[0].textContent).toMatch("10");
        expect(lastRow.querySelectorAll("td")[1].textContent).toMatch("New Value");

        // getCell
        let cell = grid.getCell(0, "Name");
        fixture.detectChanges();

        expect(cell.dataItem).toMatch("Johny");

        // getRow
        const row: IgxGridRow = grid.getRow(0);
        fixture.detectChanges();

        expect(row.record.Name).toMatch("Johny");
        expect(row.record.ID).toMatch("1");

        // updateCell

        grid.updateCell(cell.rowIndex, cell.columnField, "Timmy");
        fixture.detectChanges();

        cell = grid.getCell(cell.rowIndex, cell.columnField);
        expect(cell.dataItem).toMatch("Timmy");
    });

    it("should have row selection", () => {
        const fixture = TestBed.createComponent(IgxGridMarkupDefinitionTestComponent);
        fixture.detectChanges();

        const row: any = fixture.nativeElement.querySelector("table > tbody > tr");
        const grid = fixture.componentInstance.grid;

        const rowSpy = spyOn(grid.onRowSelection, "emit");
        row.dispatchEvent(new Event("focus"));

        fixture.detectChanges();

        expect(row.classList.contains("igx-grid__tr--selected")).toBe(true, "Focused row styling is not applied");
        expect(row.getAttribute("aria-selected")).toMatch("true", "Focused row ARIA attribute is not applied");
        expect(rowSpy.calls.count()).toBe(1);

        row.dispatchEvent(new Event("blur"));
        fixture.detectChanges();

        expect(row.classList.contains("igx-grid__tr--selected")).toBe(false, "Focused row styling is not removed");
        expect(row.getAttribute("aria-selected")).toBe(null, "Focused row ARIA attribute is not removed");

        // through API call
        grid.focusRow(0);
        fixture.detectChanges();
        expect(document.activeElement).toBe(row);

        grid.focusRow(1);
        fixture.detectChanges();
        expect(document.activeElement).toBe(fixture.nativeElement.querySelectorAll("table > tbody > tr")[1]);
    });

    it("should have cell selection", () => {
        const fixture = TestBed.createComponent(IgxGridMarkupDefinitionTestComponent);
        fixture.detectChanges();

        const cell: HTMLElement = fixture.nativeElement.querySelector("tbody td");
        const grid = fixture.componentInstance.grid;

        const cellSpy = spyOn(grid.onCellSelection, "emit");
        cell.dispatchEvent(new Event("focus"));

        fixture.detectChanges();

        expect(cell.classList.contains("igx-grid__td--selected")).toBe(true, "Focused cell styling is not applied");
        expect(cell.getAttribute("aria-selected")).toMatch("true", "Focused cell ARIA attribute is not applied");
        expect(cell.parentElement.classList.contains("igx-grid__tr--selected"))
            .toBe(true, "Focused cell does not applies parent row styling");
        expect(cellSpy.calls.count()).toBe(1);

        cell.dispatchEvent(new Event("blur"));
        fixture.detectChanges();

        expect(cell.classList.contains("igx-grid__td--selected")).toBe(false, "Focused cell styling is not removed");
        expect(cell.getAttribute("aria-selected")).toBe(null, "Focused cell ARIA attribute is not removed");
        expect(cell.parentElement.classList.contains("igx-grid__tr--selected"))
            .toBe(false, "Focused cell does not remove parent row styling");

        // through API call
        grid.focusCell(0, 0);
        fixture.detectChanges();
        expect(document.activeElement).toBe(cell);

        grid.focusCell(0, 1);
        fixture.detectChanges();
        expect(document.activeElement).toBe(fixture.nativeElement.querySelectorAll("tbody td")[1]);
    });

    it("keyboard navigation", fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxGridMarkupDefinitionTestComponent);
        const grid = fixture.componentInstance.grid;
        tick();
        fixture.detectChanges();

        const cells: HTMLElement[] = fixture.nativeElement.querySelectorAll("table > tbody td");

        grid.focusCell(0, 0);
        tick();
        fixture.detectChanges();
        expect(document.activeElement).toBe(cells[0]);

        let args: KeyboardEventInit = { key: "ArrowRight", bubbles: true };
        cells[0].dispatchEvent(new KeyboardEvent("keydown", args));
        tick();
        fixture.detectChanges();
        expect(document.activeElement).toBe(cells[1]);

        args = { key: "ArrowLeft", bubbles: true };
        cells[1].dispatchEvent(new KeyboardEvent("keydown", args));
        tick();
        fixture.detectChanges();
        expect(document.activeElement).toBe(cells[0]);

        args = { key: "ArrowDown", bubbles: true };
        cells[0].dispatchEvent(new KeyboardEvent("keydown", args));
        tick();
        fixture.detectChanges();
        expect(document.activeElement).toBe(cells[2]);

        args = { key: "ArrowUp", bubbles: true };
        cells[2].dispatchEvent(new KeyboardEvent("keydown", args));
        tick();
        fixture.detectChanges();
        expect(document.activeElement).toBe(cells[0]);
    }));

    it("should support column sorting", () => {
        const fixture = TestBed.createComponent(IgxGridMarkupDefinitionTestComponent);
        fixture.detectChanges();

        const gridElement: HTMLElement = fixture.nativeElement.querySelector("table");
        const grid = fixture.componentInstance.grid;
        const firstColumn = gridElement.querySelector("thead > tr > th");

        firstColumn.dispatchEvent(new Event("click"));
        fixture.detectChanges();

        expect(firstColumn.classList.contains("asc")).toBe(false, "Column should not be sorted ascendingly");
        grid.columns[0].sortable = true;
        fixture.detectChanges();

        firstColumn.dispatchEvent(new Event("click"));
        fixture.detectChanges();

        expect(firstColumn.classList.contains("asc")).toBe(true, "Column should be sorted ascendingly");
        expect(gridElement.querySelector("tbody > tr > td").textContent).toMatch("1");

        firstColumn.dispatchEvent(new Event("click"));
        fixture.detectChanges();

        expect(firstColumn.classList.contains("desc")).toBe(true, "Column should be sorted descendingly");
        expect(gridElement.querySelector("tbody > tr > td").textContent).toMatch("3");

        firstColumn.dispatchEvent(new Event("click"));
        fixture.detectChanges();

        expect(firstColumn.classList.contains("off")).toBe(true, "Column sorting should be removed");
        expect(gridElement.querySelector("tbody > tr > td").textContent).toMatch("3");
    });

    it("should support filetring", () => {
        const fixture = TestBed.createComponent(IgxGridMarkupDefinitionTestComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        grid.columns[0].filtering = true;
        grid.columns[0].filteringCondition = FilteringCondition.number.equals;
        grid.columns[0].dataType = 1;

        fixture.detectChanges();

        const filterInputButton: HTMLElement = fixture.nativeElement
            .querySelector(".igx-filtering__toggle > .toggle-icon");
        const tbody: HTMLElement = fixture.nativeElement.querySelector("table > tbody");

        expect(filterInputButton).toBeTruthy();

        filterInputButton.dispatchEvent(new Event("click"));
        fixture.detectChanges();

        expect(filterInputButton.classList.contains("igx-filtering__toggle--active")).toBe(true);
        const filterInput: HTMLInputElement = fixture.nativeElement.querySelector(".igx-filtering__options > input");
        expect(filterInput).toBeTruthy();

        filterInput.value = "1";
        filterInput.dispatchEvent(new Event("input"));
        fixture.detectChanges();

        expect(tbody.querySelectorAll("tr").length).toEqual(1);
        expect(tbody.querySelector("tr > td").textContent).toMatch("1");

        filterInput.value = "";
        filterInput.dispatchEvent(new Event("input"));
        fixture.detectChanges();

        expect(tbody.querySelectorAll("tr").length).toEqual(3);
        expect(tbody.querySelector("tr > td").textContent).toMatch("1");
    });

    it("should open editing modal and update data", fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxGridMarkupDefinitionTestComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const data = fixture.componentInstance.data;
        const gridElement: HTMLElement = fixture.nativeElement.querySelector("table");

        grid.columns.forEach((col) => col.editable = true);

        tick();
        fixture.detectChanges();

        let args: KeyboardEventInit = { key: "Enter", bubbles: true };
        gridElement.querySelector("tbody td:first-child")
            .dispatchEvent(new KeyboardEvent("keyup", args));

        tick();
        fixture.detectChanges();

        expect(grid.editingModal.isOpen).toBe(true);
        const dialog = gridElement.querySelector(".igx-dialog");
        expect(dialog).toBeDefined();

        tick();
        fixture.detectChanges();

        expect(dialog.querySelectorAll("input").length).toEqual(2);
        expect(dialog.querySelectorAll("input")[0].value).toMatch("1");
        expect(dialog.querySelectorAll("input")[1].value).toMatch("Johny");
        dialog.querySelector("input").value = "10000";
        dialog.querySelector("input").dispatchEvent(new Event("input"));

        tick();
        fixture.detectChanges();

        args = { key: "Enter", bubbles: true };
        dialog.dispatchEvent(new KeyboardEvent("keyup", args));

        tick();
        fixture.detectChanges();

        expect(grid.editingModal.isOpen).toBe(false);

        tick();
        fixture.detectChanges();

        expect(gridElement.querySelector("tbody > tr > td").textContent).toMatch("10000");
        expect(data[0].ID).toMatch("10000");
    }));

    it("should open editing modal and not update data on cancel", fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxGridMarkupDefinitionTestComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const data = fixture.componentInstance.data;
        const gridElement: HTMLElement = fixture.nativeElement.querySelector("table");

        grid.columns.forEach((col) => col.editable = true);

        tick();
        fixture.detectChanges();

        let args: KeyboardEventInit = { key: "Enter", bubbles: true };
        gridElement.querySelector("tbody td:first-child")
            .dispatchEvent(new KeyboardEvent("keyup", args));

        tick();
        fixture.detectChanges();

        expect(grid.editingModal.isOpen).toBe(true);
        const dialog = gridElement.querySelector(".igx-dialog");
        expect(dialog).toBeDefined();

        tick();
        fixture.detectChanges();

        expect(dialog.querySelectorAll("input").length).toEqual(2);
        expect(dialog.querySelectorAll("input")[0].value).toMatch("1");
        expect(dialog.querySelectorAll("input")[1].value).toMatch("Johny");
        dialog.querySelector("input").value = "10000";
        dialog.querySelector("input").dispatchEvent(new Event("input"));

        tick();
        fixture.detectChanges();

        args = { key: "Escape", bubbles: true };
        dialog.dispatchEvent(new KeyboardEvent("keyup", args));

        tick();
        fixture.detectChanges();

        expect(grid.editingModal.isOpen).toBe(false);

        tick();
        fixture.detectChanges();

        expect(gridElement.querySelector("tbody > tr > td").textContent).toMatch("1");
        expect(data[0].ID).toMatch("1");
    }));

    it("should paginate data", fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxGridMarkupDefinitionTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        const data = fixture.componentInstance.data;
        const gridElement: HTMLElement = fixture.nativeElement.querySelector("table");

        grid.columns.forEach((col) => col.editable = true);
        grid.perPage = 1;
        grid.paging = true;

        tick();
        fixture.detectChanges();

        expect(gridElement.querySelectorAll("tbody tr").length).toEqual(1);
        expect(gridElement.querySelector(".igx-paginator")).toBeDefined();
        expect(grid.paginator).toBeDefined();
        expect(gridElement.querySelectorAll(".igx-paginator > button").length).toEqual(4);
        expect(gridElement.querySelector(".igx-paginator > span").textContent).toMatch("1 of 3");
        expect(gridElement.querySelector("tbody > tr > td").textContent).toMatch("1");

        // Goto page 2
        gridElement.querySelectorAll(".igx-paginator > button")[2].dispatchEvent(new Event("click"));

        tick();
        fixture.detectChanges();

        expect(gridElement.querySelector(".igx-paginator > span").textContent).toMatch("2 of 3");
        expect(gridElement.querySelector("tbody > tr > td").textContent).toMatch("2");

        // Goto page 3 through API and listen for event
        spyOn(grid.onPagingDone, "emit");
        grid.paginate(2);

        tick();
        fixture.detectChanges();

        expect(grid.onPagingDone.emit).toHaveBeenCalled();
        expect(gridElement.querySelector(".igx-paginator > span").textContent).toMatch("3 of 3");
        expect(gridElement.querySelector("tbody > tr > td").textContent).toMatch("3");

        grid.paging = false;

        tick();
        fixture.detectChanges();

        expect(gridElement.querySelectorAll("tbody tr").length).toEqual(3);
        expect(gridElement.querySelector(".igx-paginator")).toBeFalsy();
    }));

    it("pagination with editing", fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxGridMarkupDefinitionTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        const data = fixture.componentInstance.data;
        const gridElement: HTMLElement = fixture.nativeElement.querySelector("table");

        grid.columns.forEach((col) => col.editable = true);
        grid.perPage = 1;
        grid.paging = true;

        tick();
        fixture.detectChanges();

        expect(gridElement.querySelectorAll("tbody tr").length).toEqual(1);
        expect(gridElement.querySelector(".igx-paginator")).toBeDefined();
        expect(grid.paginator).toBeDefined();
        expect(gridElement.querySelectorAll(".igx-paginator > button").length).toEqual(4);
        expect(gridElement.querySelector(".igx-paginator > span").textContent).toMatch("1 of 3");
        expect(gridElement.querySelector("tbody > tr > td").textContent).toMatch("1");

        gridElement.querySelectorAll(".igx-paginator > button")[2].dispatchEvent(new Event("click"));

        tick();
        fixture.detectChanges();

        expect(gridElement.querySelector(".igx-paginator > span").textContent).toMatch("2 of 3");
        expect(gridElement.querySelector("tbody > tr > td").textContent).toMatch("2");

        let args: KeyboardEventInit = { key: "Enter", bubbles: true };
        gridElement.querySelector("tbody > tr > td")
            .dispatchEvent(new KeyboardEvent("keyup", args));

        tick();
        fixture.detectChanges();

        expect(grid.editingModal.isOpen).toBe(true);
        const dialog = gridElement.querySelector(".igx-dialog");
        expect(dialog).toBeDefined();

        tick();
        fixture.detectChanges();

        expect(dialog.querySelectorAll("input").length).toEqual(2);
        expect(dialog.querySelectorAll("input")[0].value).toMatch("2");
        expect(dialog.querySelectorAll("input")[1].value).toMatch("Sally");
        dialog.querySelector("input").value = "10000";
        dialog.querySelector("input").dispatchEvent(new Event("input"));

        tick();
        fixture.detectChanges();

        args = { key: "Enter", bubbles: true };
        dialog.dispatchEvent(new KeyboardEvent("keyup", args));

        tick();
        fixture.detectChanges();

        expect(grid.editingModal.isOpen).toBe(false);

        tick();
        fixture.detectChanges();

        expect(gridElement.querySelector("tbody > tr > td").textContent).toMatch("10000");
        expect(data[1].ID).toMatch("10000");
    }));

    it("pagination with editing 2", fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxGridMarkupDefinitionTestComponent);
        fixture.detectChanges();
        const grid = fixture.componentInstance.grid;
        const data = fixture.componentInstance.data;
        const gridElement: HTMLElement = fixture.nativeElement.querySelector("table");

        grid.columns.forEach((col) => col.editable = true);
        grid.perPage = 1;
        grid.paging = true;

        tick();
        fixture.detectChanges();

        expect(gridElement.querySelectorAll("tbody tr").length).toEqual(1);
        expect(grid.paginator).toBeDefined();
        expect(gridElement.querySelector(".igx-paginator")).toBeDefined();
        expect(gridElement.querySelectorAll(".igx-paginator > button").length).toEqual(4);
        expect(gridElement.querySelector(".igx-paginator > span").textContent).toMatch("1 of 3");
        expect(gridElement.querySelector("tbody > tr > td").textContent).toMatch("1");

        gridElement.querySelectorAll(".igx-paginator > button")[2].dispatchEvent(new Event("click"));

        tick();
        fixture.detectChanges();

        expect(gridElement.querySelector(".igx-paginator > span").textContent).toMatch("2 of 3");
        expect(gridElement.querySelector("tbody > tr > td").textContent).toMatch("2");

        let args: KeyboardEventInit = { key: "Enter", bubbles: true };
        gridElement.querySelector("tbody > tr > td")
            .dispatchEvent(new KeyboardEvent("keyup", args));

        tick();
        fixture.detectChanges();

        expect(grid.editingModal.isOpen).toBe(true);
        const dialog = gridElement.querySelector(".igx-dialog");
        expect(dialog).toBeDefined();

        tick();
        fixture.detectChanges();

        expect(dialog.querySelectorAll("input").length).toEqual(2);
        expect(dialog.querySelectorAll("input")[0].value).toMatch("2");
        expect(dialog.querySelectorAll("input")[1].value).toMatch("Sally");
        dialog.querySelector("input").value = "10000";
        dialog.querySelector("input").dispatchEvent(new Event("input"));

        tick();
        fixture.detectChanges();

        args = { key: "Escape", bubbles: true };
        dialog.dispatchEvent(new KeyboardEvent("keyup", args));

        tick();
        fixture.detectChanges();

        expect(grid.editingModal.isOpen).toBe(false);

        tick();
        fixture.detectChanges();

        expect(gridElement.querySelector("tbody > tr > td").textContent).toMatch("2");
        expect(data[1].ID).toMatch("2");
    }));

    it("custom sorting (job title)", fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxGridCustomSortingTestComponent);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const data = fixture.componentInstance.data;
        const gridElement: HTMLElement = fixture.nativeElement.querySelector("table");
        const jobTitleColumn = gridElement.querySelector("thead > tr > th:nth-child(3)");

        jobTitleColumn.dispatchEvent(new Event("click"));
        fixture.detectChanges();

        expect(jobTitleColumn
            .classList.contains("asc"))
            .toBe(false, "Column should not be sorted by job title starting from CEO");
        grid.getColumnByField("JobTitle").sortable = true;
        fixture.detectChanges();

        jobTitleColumn.dispatchEvent(new Event("click"));
        fixture.detectChanges();

        expect(jobTitleColumn
            .classList.contains("asc"))
            .toBe(true, "Column should be sorted by job title starting from CEO");

        expect(grid.getRow(0).cells[0].dataItem).toMatch("6");
        expect(grid.getRow(0).cells[1].dataItem).toMatch("Erma Walsh");
        expect(grid.getRow(0).cells[2].dataItem).toMatch("CEO");

        expect(grid.getCell(1, "ID").dataItem).toMatch("1");
        expect(grid.getCell(2, "ID").dataItem).toMatch("2");
        expect(grid.getCell(3, "ID").dataItem).toMatch("3");
        expect(grid.getCell(4, "ID").dataItem).toMatch("10");
        expect(grid.getCell(5, "ID").dataItem).toMatch("8");
        expect(grid.getCell(6, "ID").dataItem).toMatch("5");
        expect(grid.getCell(7, "ID").dataItem).toMatch("4");
        expect(grid.getCell(8, "ID").dataItem).toMatch("7");
        expect(grid.getCell(9, "ID").dataItem).toMatch("9");
    }));

    xit("custom date range filtering", fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxGridCustomFilteringDateRange);
        fixture.detectChanges();

        const grid = fixture.componentInstance.grid;
        const data = fixture.componentInstance.data;
        const gridElement: HTMLElement = fixture.nativeElement.querySelector("table");
        const tbody: HTMLElement = fixture.nativeElement.querySelector("table > tbody");

        grid.getColumnByField("HireDate").filtering = true;
        // This FilteringCondition is going to be used as 'between'
        grid.getColumnByField("HireDate").filteringCondition = FilteringCondition.date.before;
        // DataType 'Date'
        grid.getColumnByField("HireDate").dataType = 3;
        fixture.detectChanges();

        expect(grid.getRow(0).cells[0].dataItem).toMatch("1");
        expect(grid.getRow(0).cells[1].dataItem).toMatch("Casey Houston");

        // Between dates
        const betweenDates = {
            Date1: "2006-12-18T11:23:17.714Z",
            Date2: "2010-11-20T10:14:12.714Z"
        };

        // Filter
        grid.filterData(JSON.stringify(betweenDates), grid.getColumnByField("HireDate"));
        fixture.detectChanges();

        expect(tbody.querySelectorAll("tr").length).toEqual(2);
        expect(grid.getRow(0).cells[0].dataItem).toMatch("4");
        expect(grid.getRow(0).cells[2].dataItem).toMatch("2008-12-18T11:23:17.714Z");
        expect(grid.getRow(1).cells[0].dataItem).toMatch("5");
        expect(grid.getRow(1).cells[2].dataItem).toMatch("2007-12-19T11:23:17.714Z");
    }));
});

@Component({
    template: `
    <igx-grid [data]="data">
        <igx-column field="ID"></igx-column>
        <igx-column field="Name"></igx-column>
    </igx-grid>
    `
})
export class IgxGridMarkupDefinitionTestComponent {

    public data = [
        { ID: 1, Name: "Johny" },
        { ID: 2, Name: "Sally" },
        { ID: 3, Name: "Tim" }
    ];

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
}

@Component({
    template: `
    <igx-grid [data]="data">
        <igx-column *ngFor="let field of ['ID', 'Name'];" [field]="field">
        </igx-column>
    </igx-grid>
    `
})
export class IgxGridngForDefinitionTestComponent {

    public data = [
        { ID: 1, Name: "Johny" },
        { ID: 2, Name: "Sally" },
        { ID: 3, Name: "Tim" }
    ];

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
}

@Component({
    template: `
    <igx-grid [data]="data">
        <igx-column field="ID">
            <ng-template igxHeader let-col="column">
                <span class="myheadertemplate">{{ col.field }}</span>
            </ng-template>
            <ng-template igxCell let-item="item">
                <span class="mybodytemplate">{{ item }}</span>
            </ng-template>
        </igx-column>
        <igx-column field="Name"></igx-column>
    </igx-grid>
    `
})
export class IgxGridTemplatedTestComponent {

    public data = [
        { ID: 1, Name: "Johny" },
        { ID: 2, Name: "Sally" },
        { ID: 3, Name: "Tim" }
    ];

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
}

@Component({
    template: `
    <igx-grid [data]="data" [autoGenerate]="true"></igx-grid>
    `
})
export class IgxGridWithAutogenerateTestComponent {

    public data = [
        { ID: 1, Name: "Johny" },
        { ID: 2, Name: "Sally" },
        { ID: 3, Name: "Tim" }
    ];

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
}

@Component({
    template: `
    <igx-grid [data]="data" >
        <igx-column [field]="'ID'" [header]="'ID'"></igx-column>
        <igx-column [field]="'Name'" [header]="'Name'"></igx-column>
        <igx-column [field]="'JobTitle'" [header]="'JobTitle'"></igx-column>
    </igx-grid>
    `
})
export class IgxGridCustomSortingTestComponent {
    public data = new CustomStrategyData().data;

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;

    public ngOnInit(): void {
        this.grid.state = {
            sorting: {
                expressions: [],
                strategy: new CustomJobTitleSortingStrategy()
            }
        };
    }
}

@Component({
    template: `<igx-grid [data]="data">
        <igx-column [field]="'ID'" [header]="'ID'"></igx-column>
        <igx-column [field]="'Name'" [header]="'Name'"></igx-column>
        <igx-column [field]="'HireDate'" [header]="'HireDate'">
            <ng-template igxHeader let-col="column">
                <span class="myheadertemplate">{{ col.field }}</span>
            </ng-template>
            <ng-template igxCell let-item="item">
                <span class="mybodytemplate">{{ item | date: 'dd/MM/yyyy'}}</span>
            </ng-template>
        </igx-column>
    </igx-grid>`
})
export class IgxGridCustomFilteringDateRange {
    public data = new CustomStrategyData().data;

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;

    public ngOnInit(): void {
        this.grid.state = {
            filtering: {
                expressions: [],
                strategy: new CustomDateRangeFilteringStrategy()
            }
        };
    }
}
