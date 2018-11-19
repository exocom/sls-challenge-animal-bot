import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map} from 'rxjs/operators';

type mappingState = 'TRAIN' | 'TEST' | 'VALIDATION';

export interface ImageMapping {
  id: number,
  state: mappingState | null,
  gsPath: string;
  tags: Array<string>;
  url: string;
}

interface ImagesCsvMappingsRequestQueryStringParameters {
  limit: number;
  skip: number;
}

interface UpdateImagesCsvMappingRequestBody {
  id: number;
  state: mappingState;
  gsPath: string;
  tags: Array<string>;
}

interface ApiResponse<T> {
  data: T
}


@Injectable({
  providedIn: 'root'
})
export class AnimalBotService {

  private url = 'http://localhost:5000/http/images/csv-mappings';

  constructor(private http: HttpClient) {
  }

  getCsvImageMappings({skip, limit}: ImagesCsvMappingsRequestQueryStringParameters) {
    const params = new HttpParams().set('skip', skip.toString()).set('limit', limit.toString());
    return this.http.get<ApiResponse<Array<ImageMapping>>>(this.url, {params})
      .pipe(map(body => body.data));
  }

  updateCsvImageMapping(body: UpdateImagesCsvMappingRequestBody) {
    return this.http.put<ApiResponse<ImageMapping>>(`${this.url}/${body.id}`, body)
      .pipe(map(body => body.data));
  }
}
