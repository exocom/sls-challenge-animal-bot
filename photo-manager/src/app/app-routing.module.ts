import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

const routes: Routes = [
  {path: '', redirectTo: '/photo-tagging/1', pathMatch: 'full'},
  {path: '', loadChildren: './photo-tagger/photo-tagger.module#PhotoTaggerModule'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
