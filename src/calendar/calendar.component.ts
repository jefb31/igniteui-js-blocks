import { transition, trigger, useAnimation } from "@angular/animations";
import { CommonModule } from "@angular/common";
import {
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input,
    NgModule,
    OnInit,
    Output
} from "@angular/core";
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { fadeIn, scaleInCenter, slideInLeft, slideInRight } from "../animations/main";
import { IgxIconModule } from "../icon/icon.component";
import { Calendar, ICalendarDate, range, weekDay, WEEKDAYS } from "./calendar";

export enum CalendarView {
    DEFAULT,
    YEAR,
    DECADE
}

/**
 *
 *
 * @export
 * @class IgxCalendarComponent
 * @implements {OnInit}
 * @implements {DoCheck}
 * @implements {ControlValueAccessor}
 */
@Component({
    animations: [
        trigger("animateView", [
            transition("void => 0", useAnimation(fadeIn)),
            transition("void => *", useAnimation(scaleInCenter, {
                params: {
                    duration: ".2s",
                    fromScale: .9
                }
            }))
        ]),
        trigger("animateChange", [
            transition("* => prev", useAnimation(slideInLeft, {
                params: {
                    fromPosition: "translateX(-30%)"
                }
            })),
            transition("* => next", useAnimation(slideInRight, {
                params: {
                    fromPosition: "translateX(30%)"
                }
            }))
        ])
    ],
    moduleId: module.id,
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxCalendarComponent, multi: true }],
    selector: "igx-calendar",
    styleUrls: ["./calendar.component.css"],
    templateUrl: "calendar.component.html"
})
export class IgxCalendarComponent implements OnInit, ControlValueAccessor {

    /**
     * Returns the day on which the week starts
     *
     * @readonly
     * @type {(WEEKDAYS | number)}
     * @memberof IgxCalendarComponent
     */
    @Input() public get weekStart(): WEEKDAYS | number {
        return this.calendarModel.firstWeekDay;
    }
    public set weekStart(value: WEEKDAYS | number) {
        this.calendarModel.firstWeekDay = value;
    }
    @Input() public locale: string = "en";
    @Input() public get selection(): string {
        return this._selection;
    }
    public set selection(value) {
        switch (value) {
            case "single":
                this.selectedDates = null;
                break;
            case "multi":
            case "range":
                this.selectedDates = [];
                break;
            default:
                throw new Error("Invalid selection value");
        }
        this._onChangeCallback(this.selectedDates);
        this._rangeStarted = false;
        this._selection = value;
    }

    @Input() public get viewDate(): Date {
        return this._viewDate;
    }

    public set viewDate(value: Date) {
        this._viewDate = new Date(value);
    }
    @Output() public onSelection = new EventEmitter<Date | Date[]>();

    public get value(): Date | Date[] {
        return this.selectedDates;
    }

    public set value(val: Date | Date[]) {
        this.selectDate(val);
    }

    @Input() public formatOptions = {
        day: "numeric",
        month: "short",
        weekday: "short",
        year: "numeric"
    };

    private calendarModel: Calendar;
    private _viewDate: Date;
    private headerDate: Date;
    private activeView = CalendarView.DEFAULT;
    private selectedDates;
    private _selection: "single" | "multi" | "range" = "single";
    private _rangeStarted: boolean = false;
    private monthAction = "";

    constructor(private elementRef: ElementRef) {
        this.calendarModel = new Calendar();
    }

    public registerOnChange(fn: (_: Date) => void) { this._onChangeCallback = fn; }
    public registerOnTouched(fn: () => void) { this._onTouchedCallback = fn; }

    public writeValue(value: Date | Date[]) {
        this.selectedDates = value;
    }

    public ngOnInit(): void {
        this.calendarModel.firstWeekDay = this.weekStart;

        const today = new Date(Date.now());

        if (!this._viewDate) {
            this._viewDate = new Date(today);
        }

        this.headerDate = new Date(today);
    }

    public generateWeekHeader(): string[] {
        const dayNames: string[] = [];
        const rv = this.calendarModel.monthdatescalendar(this.viewDate.getFullYear(), this.viewDate.getMonth())[0];

        for (const day of rv) {
            dayNames.push(day.date.toLocaleString(this.locale, { weekday: this.formatOptions.weekday }));
        }

        return dayNames;
    }

    public get getCalendarMonth(): ICalendarDate[][] {
        return this.calendarModel.monthdatescalendar(this.viewDate.getFullYear(), this.viewDate.getMonth(), true);
    }

    public onDateClick(event: MouseEvent): void {
        const target: any = event.target;

        if (target.nodeName.toLowerCase() !== "span") {
            return;
        }

        if (target.dataset.prevmonth) {
            this.prevMonth();
        }

        if (target.dataset.nextmonth) {
            this.nextMonth();
        }

        const value = new Date(this._viewDate.getFullYear(),
            this._viewDate.getMonth(), parseInt(target.textContent, 10));

        this.selectDate(value);
    }

    public selectDate(date: Date | Date[]): void {

        switch (this.selection) {
            case "single":
                this.selectSingle(date as Date);
                break;
            case "multi":
                this.selectMulti(date);
                break;
            case "range":
                this.selectRange(date);
                break;
            default:
                this.selectSingle(date as Date);
        }

        this.onSelection.emit(this.selectedDates);
    }

    protected selectSingle(newVal: Date): void {
        this.selectedDates = newVal;
        this._onChangeCallback(this.selectedDates);
    }

    protected selectMulti(newVal: Date | Date[]): void {
        if (newVal instanceof Array) {
            // XXX: Behavior for deselect with array
            this.selectedDates = this.selectedDates.concat(newVal);
        } else {
            if (this.selectedDates.every((date: Date) => date.toDateString() !== newVal.toDateString())) {
                this.selectedDates.push(newVal);
            } else {
                // Deselect if already selected
                this.selectedDates = this.selectedDates.filter(
                    (date: Date) => date.toDateString() !== newVal.toDateString()
                );
            }
        }
        this._onChangeCallback(this.selectedDates);
    }

    protected selectRange(newVal: Date | Date[]): void {

        if (newVal instanceof Array) {

            this._rangeStarted = false;
            newVal.sort((a: Date, b: Date) => a.valueOf() - b.valueOf());
            let start: Date = newVal[0];
            this.selectedDates = [start];

            while (start.toDateString() !== newVal[newVal.length - 1].toDateString()) {
                start = this.calendarModel.timedelta(start, "day", 1);
                this.selectedDates.push(start);
            }
        } else {
            // Single date toggle on range selection
            if (!this._rangeStarted) {
                this._rangeStarted = true;
                this.selectedDates = [newVal];
            } else {
                // End value for range selection mode; toggle off
                this._rangeStarted = false;

                // Selected range end is the same as start; toggle new range selection
                /// XXX: Or maybe we should just return a range of 1 ??
                if (this.selectedDates[0].toDateString() === newVal.toDateString()) {
                    this.selectedDates = [];
                    this._onChangeCallback(this.selectedDates);
                    return;
                }
                this.selectedDates.push(newVal);
                this.selectedDates.sort((a: Date, b: Date) => a.valueOf() - b.valueOf());

                let start: Date = this.selectedDates[0];
                const end: Date = this.selectedDates.pop();

                while (start.toDateString() !== end.toDateString()) {
                    start = this.calendarModel.timedelta(start, "day", 1);
                    this.selectedDates.push(start);
                }
            }
        }
        this._onChangeCallback(this.selectedDates);
    }
    protected prevMonth(): void {
        this._viewDate = this.calendarModel.timedelta(this._viewDate, "month", -1);
        this.monthAction = "prev";
    }

    protected nextMonth(): void {
        this._viewDate = this.calendarModel.timedelta(this._viewDate, "month", 1);
        this.monthAction = "next";
    }

    // Event handlers for scrolling/keyboard interaction
    protected handleScroll(event) {
        event.preventDefault();
        event.stopPropagation();

        const currentYear = new Date(Date.now()).getFullYear();

        const delta = event.deltaY < 0 ? 1 : -1;

        // Limit to [-100, +100] years
        if (delta > 0 && this._viewDate.getFullYear() - currentYear >= 95) {
            return;
        }
        if (delta < 0 && currentYear - this._viewDate.getFullYear() >= 95) {
            return;
        }
        this._viewDate = this.calendarModel.timedelta(this._viewDate, "year", delta);
    }

    protected handlePageUpDown(event) {
        event.preventDefault();

        if (event.key === "PageUp") {
            if (event.shiftKey) {
                this.viewDate = this.calendarModel.timedelta(this.viewDate, "year", -1);
            } else {
                this.prevMonth();
            }
        } else {
            if (event.shiftKey) {
                this.viewDate = this.calendarModel.timedelta(this.viewDate, "year", 1);
            } else {
                this.nextMonth();
            }
        }
    }

    protected handleKeyDown(event) {

        if (event.key.startsWith("Page")) {
            this.handlePageUpDown(event);
            return;
        }

        if (event.key.endsWith("Left") || event.key.endsWith("Right") ||
            event.key.endsWith("Up") || event.key.endsWith("Down")) {
            this.handleKeyboardNavigation(event);
            return;
        }

        switch (event.key) {
            case "Home":
                event.preventDefault();
                this.elementRef.nativeElement.querySelectorAll("[data-curmonth='true']")[0].focus();
                break;
            case "End":
                event.preventDefault();
                const curentDates = this.elementRef.nativeElement.querySelectorAll("[data-curmonth='true']");
                curentDates[curentDates.length - 1].focus();
                break;
            case "Enter":
                this.onDateClick(event);
                break;
            default:
                return;
        }
    }

    protected handleKeyboardNavigation(event) {
        event.preventDefault();

        if (event.target.nodeName.toLowerCase() !== "span") {
            return;
        }

        const target = event.target;
        let dest = null;

        if (event.key.endsWith("Left")) {
            dest = target.previousElementSibling;
            if (dest) {
                dest.focus();
            }
        }
        if (event.key.endsWith("Right")) {
            dest = target.nextElementSibling;
            if (dest) {
                dest.focus();
            }
        }
        if (event.key.endsWith("Down")) {
            const targetIndex = Array.from(target.parentNode.children).indexOf(target);
            dest = target.parentNode.nextElementSibling;
            if (dest) {
                dest.children[targetIndex].focus();
            }
        }
        if (event.key.endsWith("Up")) {
            const targetIndex = Array.from(target.parentNode.children).indexOf(target);
            dest = target.parentNode.previousElementSibling;
            if (dest) {
                dest.children[targetIndex].focus();
            }
        }
    }

    // Util methods for the template

    protected getMonthName(date: Date): string {
        return date.toLocaleString(this.locale, { month: this.formatOptions.month });
    }
    protected getFormattedDate(): { weekday: string, monthday: string } {

        const date = this.selectedDates ? this.selectedDates : this.headerDate;

        return {
            monthday: date.toLocaleString(
                this.locale, { month: this.formatOptions.month, day: this.formatOptions.day }),
            weekday: date.toLocaleString(this.locale, { weekday: this.formatOptions.weekday })
        };
    }

    protected getHeaderYear(): string {
        let res = this.headerDate.toLocaleString(this.locale, { year: this.formatOptions.year });

        if (this.selectedDates) {
            res = this.selectedDates.toLocaleString(this.locale, { year: this.formatOptions.year });
        }
        return res;
    }

    protected isInactive(day: ICalendarDate): boolean {
        return day.isNextMonth || day.isPrevMonth;
    }

    protected isWeekend(day: ICalendarDate): boolean {
        return day.date.getDay() === 0 || day.date.getDay() === 6;
    }

    protected isCurrentMonth(value: Date): boolean {
        return this.viewDate.getMonth() === value.getMonth();
    }

    protected isCurrentYear(value: number): boolean {
        return this.viewDate.getFullYear() === value;
    }

    protected isSelected(day: ICalendarDate): boolean {
        if (this.selection === "multi" || this.selection === "range") {
            for (const date of this.selectedDates) {
                if (date.toDateString() === day.date.toDateString()) {
                    return true;
                }
            }
            return false;
        }
        if (this.selectedDates) {
            return day.date.toDateString() === this.selectedDates.toDateString();
        }
        return false;
    }

    protected isToday(day: ICalendarDate): boolean {
        const today = new Date(Date.now());
        return (day.date.getFullYear() === today.getFullYear() &&
            day.date.getMonth() === today.getMonth() &&
            day.date.getDate() === today.getDate());
    }

    protected get isDefaultView(): boolean {
        return this.activeView === CalendarView.DEFAULT;
    }

    protected get isYearView(): boolean {
        return this.activeView === CalendarView.YEAR;
    }

    protected get isDecadeView(): boolean {
        return this.activeView === CalendarView.DECADE;
    }

    protected activeViewYear(): void {
        this.activeView = CalendarView.YEAR;
    }

    protected activeViewDecade(): void {
        this.activeView = CalendarView.DECADE;
    }

    // XXX: WiP! Will still have to discuss what are we showing
    //      and how are we showing it
    protected getDecade(): number[] {
        const res = [];
        const start = this._viewDate.getFullYear() - 5;
        const end = this._viewDate.getFullYear() + 6;

        for (const year of range(start, end)) {
            res.push(year);
        }

        return res;
    }

    protected getYear(): Date[] {
        let start = new Date(this._viewDate.getFullYear(), 0, 1);
        const res = [];

        for (let i = 0; i < 12; i++) {
            res.push(start);
            start = this.calendarModel.timedelta(start, "month", 1);
        }

        return res;
    }

    protected changeYear(event): void {
        const year = parseInt(event.target.textContent, 10);
        this._viewDate = new Date(year, this._viewDate.getMonth(), 1);
        this.activeView = CalendarView.DEFAULT;
    }

    protected changeMonth(event): void {
        const month = event.target.dataset.index;
        this._viewDate = new Date(this._viewDate.getFullYear(), month, 1);
        this.activeView = CalendarView.DEFAULT;
    }

    protected dateTracker(index, item): string {
        return `${item.date.getMonth()}{item.date.getDate()}`;
    }

    protected rowTracker(index, item): string {
        return `${item[index].date.getMonth()}${item[index].date.getDate()}`;
    }

    protected monthTracker(index, item): number {
        return index;
    }

    private _onTouchedCallback: () => void = () => { };
    private _onChangeCallback: (_: Date) => void = () => { };
}

@NgModule({
    declarations: [IgxCalendarComponent],
    exports: [IgxCalendarComponent],
    imports: [CommonModule, FormsModule, BrowserAnimationsModule, IgxIconModule]
})
export class IgxCalendarModule { }
