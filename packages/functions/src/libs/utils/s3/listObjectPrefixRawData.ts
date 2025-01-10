import { GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

import { s3Client } from '~/clients/s3';

export const listObjectPrefixRawData = async ({
  bucketName,
  prefix,
}: {
  bucketName: string;
  prefix: string;
}): Promise<string[]> => {
  const listCommand = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: prefix,
  });
  const { Contents, KeyCount } = await s3Client.send(listCommand);

  if (KeyCount === undefined || Contents === undefined) {
    throw new Error('No content');
  }

  const rawDataList = await Promise.all(
    Contents.map(async ({ Key }) => {
      if (Key === undefined) {
        throw new Error('No key');
      }

      const { Body: rawData } = await s3Client.send(
        new GetObjectCommand({
          Key,
          Bucket: bucketName,
        }),
      );

      if (rawData === undefined) {
        throw new Error('No rawdata');
      }

      const base64 = await rawData.transformToString('base64');

      return base64;
    }),
  );

  return rawDataList;
};
