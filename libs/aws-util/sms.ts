export type SMSType = "Promotional" | "Transactional";
export type Status = "SUCCESS" | "FAILURE";

export interface IDirectPublishToPhoneNumberEvent {
  notification: {
    messageId: string;
    timestamp: string;
  },
  delivery: {
    phoneCarrier: string;
    mnc: number;
    destination: string;
    priceInUSD: number;
    smsType: SMSType;
    mcc: number;
    providerResponse: string;
    dwellTimeMs: number;
    dwellTimeMsUntilDeviceAck: number;
  },
  status: Status;
}

export interface ISendEmailRequest {
  Subject: string;
  To: string;
  Bcc: Array<string>;
  Template: {
    HtmlS3Key: string;
    TextS3Key: string;
    Data: any;
  };
}

export interface ISendSmsRequest<T> {
  To: string;
  Template: {
    Key: string;
    Data: T;
  }
}

export interface ISmsTemplateData {
  OrderDetailUrl: string,
  MainId: number,
  FirstName: string
}
