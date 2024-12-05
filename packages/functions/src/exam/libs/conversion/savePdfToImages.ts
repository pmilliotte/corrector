import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { fromBuffer } from 'pdf2pic';
import { Readable } from 'stream';

import { FileType, PDF_FILE_NAME } from '@corrector/shared';

import { s3Client } from '~/clients/s3';

export const savePdfToImages = async ({
  bucketName,
  fileType,
  prefix,
}: {
  bucketName: string;
  fileType: FileType;
  prefix: string;
}): Promise<void> => {
  const { Body: rawData } = await s3Client.send(
    new GetObjectCommand({
      Key: `${prefix}/${fileType}/${PDF_FILE_NAME}.pdf`,
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

  const response = await convert.bulk(-1, {
    responseType: 'buffer',
  });

  await Promise.all(
    response.map(({ buffer }, index) =>
      s3Client.send(
        new PutObjectCommand({
          Key: `${prefix}/${fileType}/images/page-${index}.jpeg`,
          Bucket: bucketName,
          ContentType: 'image/jpeg',
          Body: buffer,
        }),
      ),
    ),
  );
};
