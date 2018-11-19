import {Injectable} from '@angular/core';
import {AnimalBotService} from './animal-bot.service';

@Injectable({
  providedIn: 'root'
})
export class PhotoTaggerService {

  constructor(private animalBot: AnimalBotService) {

  }

  getImageMappings({index, limit}: { index: number, limit: number }) {
    if (index < 0) return null;

    const halfLimit = Math.ceil(limit / 2);

    const position = index % limit || limit;
    const skip = position > halfLimit ? index - halfLimit : (index - position);

    return this.animalBot.getCsvImageMappings({
      skip,
      limit
    });
  }
}
