import { NgModule } from "@angular/core";
import { IgxComponentsModule, IgxDirectivesModule } from "../../../src/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { AvatarSampleComponent } from "./sample.component";

@NgModule({
    declarations: [AvatarSampleComponent],
    imports: [IgxComponentsModule, IgxDirectivesModule, PageHeaderModule]
})
export class AvatarSampleModule { }
