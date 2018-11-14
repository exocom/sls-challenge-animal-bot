import {APIGatewayEvent, APIGatewayProxyResult, Context, ScheduledEvent} from 'aws-lambda';


type headers = {
  [header: string]: boolean | number | string;
};

export type lambdaUtilOptions = {
  headers?: headers;
};

export class LambdaUtil {
  private _headers: headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Content-Type': 'application/json'
  };

  constructor({headers}: lambdaUtilOptions = {}) {
    if (headers) this._headers = headers;
  }

  apiResponseJson<T>({statusCode = 200, body = null, headers = this._headers}: ApiJsonResponse<T>): APIGatewayProxyResult {
    return {
      statusCode,
      body: body ? JSON.stringify(body) : "",
      headers
    };
  }

  apiResponseBinary<T>({statusCode = 200, body = null, headers = this._headers}: ApiBinaryResponse<T>): APIGatewayProxyResult {
    return {
      isBase64Encoded: true,
      statusCode,
      body: body.toString('base64'),
      headers
    };
  }
}

export type ScheduleEventHandler<T = ScheduledEvent> = (
  event: T,
  context: Context
) => void;

export type ApiGatewayHandler = (
  event: APIGatewayEvent,
  context: Context
) => Promise<APIGatewayProxyResult>;

interface ApiJsonResponse<T> {
  statusCode?: number;
  body?: ApiBody<T> | ApiErrorsBody<T>;
  headers?: headers;
}

interface ApiBinaryResponse<T> {
  statusCode?: number;
  body?: Buffer | null;
  headers?: headers;
}

export interface ApiBody<T> {
  data: T;
  meta?: Meta;
}

export interface ApiErrorsBody<T> {
  errors: Array<T>;
  meta?: Meta;
}

export interface Meta {
}
