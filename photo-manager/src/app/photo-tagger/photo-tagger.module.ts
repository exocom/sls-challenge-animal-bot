import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {PhotoTaggerRoutingModule} from './photo-tagger-routing.module';
import {PhotoTaggerComponent} from './photo-tagger.component';
import {MatBadgeModule, MatButtonModule, MatCheckboxModule} from '@angular/material';

@NgModule({
  declarations: [PhotoTaggerComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    MatBadgeModule,
    PhotoTaggerRoutingModule
  ]
})
export class PhotoTaggerModule {
}
