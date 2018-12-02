import {ScheduleEventHandler} from '../../libs/lambda-util/lambda-util';
import {DynamoDBStreamHandler, S3Handler, SNSHandler, SQSHandler, CloudWatchLogsHandler, CognitoUserPoolTriggerHandler} from "../../libs/lambda-util/node_modules/@types/aws-lambda";

// export const handler: DynamoDBStreamHandler = async (event, context) => {
// export const handler: S3Handler = async (event, context) => {
// export const handler: ScheduleEventHandler = async (event, context) => {
// export const handler: SNSHandler = async (event, context) => {
// export const handler: SQSHandler = async (event, context) => {
// export const handler: CloudWatchLogsHandler = async (event, context) => {
// export const handler: CognitoUserPoolTriggerHandler = async (event, context) => {

// };

/*
  API Gateway data comes in on the request body, query string, and path parameters.

  Recommend:
    Use class-transformer to get values into a strongly typed class.
    yarn add class-transformer

    Use lambdaUtil.apiResponseJson for easy status code and body
    status code defaults to 200

  Optional:
    Use decorator based validation.
    yarn add class-validator
    NOTE: classes must be declared before they are used. Otherwise validator will fail on nested objects/classes.
*/

// import {deserialize, plainToClass} from 'class-transformer'; // Recommend
// import {validate} from 'class-validator';  // Optional
// import {ApiGatewayHandler, LambdaUtil} from '../../libs/lambda-util/lambda-util';
//
// const lambdaUtil = new LambdaUtil();
//
// class QueryStringParameters {}
// class Body {}
// class PathParameters {}
//
// export const handler: ApiGatewayHandler = async (event) => {
//   const queryStringParameters = plainToClass(QueryStringParameters, event.queryStringParameters);
//   const body = deserialize(Body, event.body);
//   const pathParameters = plainToClass(PathParameters, event.pathParameters);
//
//   const queryErrors = await validate(queryStringParameters) || [];
//   const bodyErrors = await validate(body) || [];
//   const pathErrors = await validate(pathParameters) || [];
//
//   if (queryErrors.length || bodyErrors.length || pathErrors.length) {
//     const errors = [...queryErrors, ...bodyErrors, ...pathErrors].map((err) => {
//       return {
//         type: 'Validation',
//         message: err && err.message || err
//       };
//     });
//     return lambdaUtil.apiResponseJson({statusCode: 400, body: {errors}});
//   }
//
//   const data = 'Thanks for using @kalarrs!';
//   return lambdaUtil.apiResponseJson({body: {data}});
// };
