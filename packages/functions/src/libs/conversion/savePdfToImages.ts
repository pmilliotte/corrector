import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { fromBuffer } from 'pdf2pic';
import { Readable } from 'stream';

import { PDF_FILE_NAME } from '@corrector/shared';

import { s3Client } from '~/clients/s3';

export const savePdfToImages = async ({
  bucketName,
  prefix,
}: {
  bucketName: string;
  prefix: string;
}): Promise<{
  id?: string;
  originalFileName?: string;
  uploadedAt?: string;
}> => {
  const {
    Body: rawData,
    Metadata,
    LastModified,
  } = await s3Client.send(
    new GetObjectCommand({
      Key: `${prefix}/${PDF_FILE_NAME}.pdf`,
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

  convert.setGMClass(process.env.GM_PATH ?? '');

  const response = await convert.bulk(-1, {
    responseType: 'buffer',
  });

  await Promise.all(
    response.map(({ buffer }, index) =>
      s3Client.send(
        new PutObjectCommand({
          Key: `${prefix}/images/page-${index}.jpeg`,
          Bucket: bucketName,
          ContentType: 'image/jpeg',
          Body: buffer,
        }),
      ),
    ),
  );

  return {
    id: Metadata?.['created-uuid'],
    originalFileName:
      Metadata?.['original-file-name'] !== undefined
        ? decodeURIComponent(Metadata['original-file-name'])
        : undefined,
    uploadedAt: LastModified?.toISOString(),
  };
};
