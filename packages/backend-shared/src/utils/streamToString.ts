import { Readable } from 'stream';

// https://github.com/aws/aws-sdk-js-v3/issues/1877
// We are forced to use this util to retrieve the string of the s3 object
export const streamToString = async (stream: Readable): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on('data', (chunk: Uint8Array) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
