import {Component, OnInit} from '@angular/core';
import {PhotoTaggerService} from '../photo-tagger.service';
import {ActivatedRoute} from '@angular/router';
import {ImageMapping} from '../animal-bot.service';
import {FormBuilder} from '@angular/forms';
import {Subject, Subscription, timer} from 'rxjs';
import {debounce, tap} from 'rxjs/operators';

interface FormEvent {
  tagForm: TagForm;
  imageMapping: ImageMapping;
}

interface TagForm {
  dandy: boolean;
  qt: boolean;
  meow: boolean;
  honey: boolean;
  scarlett: boolean;
  remove: boolean;
}

const formDefault = {
  dandy: false,
  qt: false,
  meow: false,
  honey: false,
  scarlett: false,
  remove: false
};

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
  tagForm = this.fb.group({
    ...formDefault
  });

  private formSubject = new Subject<FormEvent>();
  private currentFormSubscription: Subscription;

  constructor(private photoTagger: PhotoTaggerService, private route: ActivatedRoute, private fb: FormBuilder) {
    this.route.params.subscribe(params => {
      this.load(params.photoId);
    });

    this.tagForm.valueChanges.subscribe((tagForm: TagForm) => {
      this.formSubject.next({
        tagForm,
        imageMapping: this.activeImageMapping
      });
    });
  }

  ngOnInit() {
  }

  next() {
    if (!this.activeImageMapping) return;
    this.load(this.activeImageMapping.id + 1);
  }

  async reset() {
    if (this.currentFormSubscription && !this.currentFormSubscription.closed) {
      this.currentFormSubscription.unsubscribe();
    }
    if (this.tagForm.dirty) await this.save({
      imageMapping: this.activeImageMapping,
      tagForm: this.tagForm.value
    });
  }

  save({imageMapping, tagForm}) {
    const tags = Object.keys(tagForm).reduce((tags, key) => {
      if (tagForm[key]) tags.push(key);
      return tags;
    }, []);

    return this.photoTagger.saveImageMapping({
      ...imageMapping,
      tags
    }).toPromise().then(() => {
      this.tagForm.markAsPristine();
      this.tagForm.markAsUntouched();
    });
  }

  async load(photoId) {
    await this.reset();

    this.photoTagger.getImageMappings({limit: this.limit, index: photoId})
      .subscribe(imageMappings => {
        this.imageMappings = imageMappings;
        const position = photoId < this.limit ? photoId % this.limit : this.halfLimit;
        this.activeImageMapping = imageMappings[position - (position > this.halfLimit ? 2 : 1)];

        Object.keys(this.tagForm.controls).forEach(key => {
          this.tagForm.controls[key].setValue(false)
        });
        this.activeImageMapping.tags.forEach(tag => {
          this.tagForm.controls[tag].setValue(true);
        });
        this.tagForm.markAsPristine();
        this.tagForm.markAsUntouched();

        this.currentFormSubscription = this.formSubject.asObservable()
          .pipe(debounce(() => timer(5000)))
          .subscribe((formEvent) => {
            if (this.tagForm.dirty) return this.save(formEvent);
          });
      });
  }

}
