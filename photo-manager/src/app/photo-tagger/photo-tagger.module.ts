import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {PhotoTaggerRoutingModule} from './photo-tagger-routing.module';
import {PhotoTaggerComponent} from './photo-tagger.component';
import {MatBadgeModule, MatButtonModule, MatCardModule, MatCheckboxModule, MatChipsModule} from '@angular/material';

@NgModule({
  declarations: [PhotoTaggerComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    MatBadgeModule,
    MatCardModule,
    MatChipsModule,
    PhotoTaggerRoutingModule
  ]
})
export class PhotoTaggerModule {
}
