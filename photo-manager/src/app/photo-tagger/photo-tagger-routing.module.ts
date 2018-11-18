import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {PhotoTaggerComponent} from './photo-tagger.component';

const routes: Routes = [
  {path: 'photo-tagging/:photoId', component: PhotoTaggerComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PhotoTaggerRoutingModule {
}
