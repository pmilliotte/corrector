import * as aws from '@aws-sdk/client-ses';
import nodemailer from 'nodemailer';

const sesClient = new aws.SESClient({});

export const transporter = nodemailer.createTransport({
  //@ts-expect-error typing doesn't allow secure and SES to be defined, but the properties are both needed
  SES: { ses: sesClient, aws },
  secure: true,
});
