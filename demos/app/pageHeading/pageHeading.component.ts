import { Component, Input } from "@angular/core";

@Component({
    moduleId: module.id,
    selector: "page-header",
    styleUrls: ["./pageHeading.styles.css"],
    templateUrl: "./pageHeading.template.html"
})
export class PageHeaderComponent {
    @Input() private title: string;
    @Input() private description: string;
}
