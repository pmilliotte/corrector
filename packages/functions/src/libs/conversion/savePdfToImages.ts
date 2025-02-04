import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { fromBuffer } from 'pdf2pic';
import { Readable } from 'stream';

import { s3Client } from '~/clients/s3';

export const savePdfToImages = async ({
  bucketName,
  key,
  destination,
}: {
  bucketName: string;
  key: string;
  destination: string;
}): Promise<void> => {
  const { Body: rawData } = await s3Client.send(
    new GetObjectCommand({
      Key: key,
      Bucket: bucketName,
    }),
  );

  if (rawData === undefined) {
    throw new Error('File not found');
  }

  const rawDataBuffer = Buffer.concat(
    await Readable.from(rawData as Readable).toArray(),
  );

  const convert = fromBuffer(rawDataBuffer, {
    format: 'jpeg',
    savePath: '/tmp',
    preserveAspectRatio: true,
    saveFilename: 'file',
    density: 600,
    quality: 100,
  });

  convert.setGMClass('/opt/homebrew/Cellar/graphicsmagick/1.3.45_1/bin/');

  const response = await convert.bulk(-1, {
    responseType: 'buffer',
  });

  await Promise.all(
    response.map(({ buffer }, index) =>
      s3Client.send(
        new PutObjectCommand({
          Key: `${destination}/page-${index}.jpeg`,
          Bucket: bucketName,
          ContentType: 'image/jpeg',
          Body: buffer,
        }),
      ),
    ),
  );
};
