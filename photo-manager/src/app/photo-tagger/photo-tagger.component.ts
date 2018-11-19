import {Component, OnInit} from '@angular/core';
import {PhotoTaggerService} from '../photo-tagger.service';
import {ActivatedRoute} from '@angular/router';
import {ImageMapping} from '../animal-bot.service';

@Component({
  selector: 'app-photo-tagger',
  templateUrl: './photo-tagger.component.html',
  styleUrls: ['./photo-tagger.component.scss']
})
export class PhotoTaggerComponent implements OnInit {
  limit = 5;
  halfLimit = Math.ceil(this.limit / 2);
  imageMappings: Array<ImageMapping>;
  activeImageMapping: ImageMapping;

  constructor(private photoTagger: PhotoTaggerService, private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.load(params.photoId);
    })
  }

  ngOnInit() {
  }

  next() {
    if (!this.activeImageMapping) return;
    this.load(this.activeImageMapping.id + 1);
  }

  load(photoId) {
    this.photoTagger.getImageMappings({limit: this.limit, index: photoId})
      .subscribe(imageMappings => {
        this.imageMappings = imageMappings;
        const position = photoId < this.limit ? photoId % this.limit : this.halfLimit;
        this.activeImageMapping = imageMappings[position - (position > this.halfLimit ? 2 : 1)];
      });
  }

}
