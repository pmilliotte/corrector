import { DeleteObjectsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

import { s3Client } from '~/clients/s3';

export const deleteOjects = async ({
  bucketName,
  prefix,
}: {
  bucketName: string;
  prefix: string;
}): Promise<void> => {
  const listCommand = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: prefix,
  });
  const { Contents, KeyCount } = await s3Client.send(listCommand);

  if (KeyCount === undefined || Contents === undefined) {
    return;
  }

  const deleteCommand = new DeleteObjectsCommand({
    Bucket: bucketName,
    Delete: {
      Objects: Contents.map(item => ({ Key: item.Key })),
      Quiet: false,
    },
  });
  const deleted = await s3Client.send(deleteCommand);
  if (deleted.Errors) {
    throw new Error(deleted.Errors[0].Message);
  }
};
