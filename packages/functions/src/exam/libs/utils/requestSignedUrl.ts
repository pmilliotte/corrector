import { GetObjectCommand } from '@aws-sdk/client-s3';
import {
  createPresignedPost,
  type PresignedPostOptions,
} from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { s3Client } from '~/clients';

import { Metadata } from '../types';

export const requestSignedUrlPost = async ({
  contentType,
  fileKey,
  metadata,
  bucketName,
}: {
  contentType: string;
  fileKey: string;
  //metadata arguments must start with x-amz-meta- and be written in kebab case
  metadata: Metadata;
  bucketName: string;
}): Promise<{ url: string; fields: Record<string, string> }> => {
  const Fields = { key: fileKey, ...metadata };
  const Key = fileKey;
  const Conditions: PresignedPostOptions['Conditions'] = [
    ['content-length-range', 10, 10e6],
    { 'Content-Type': contentType },
  ];

  const { url, fields } = await createPresignedPost(s3Client, {
    Bucket: bucketName,
    Key,
    Conditions,
    Fields,
    Expires: 300,
  });

  return { url, fields };
};

export const requestSignedUrlGet = async ({
  fileKey,
  bucketName,
}: {
  fileKey: string;
  bucketName: string;
}): Promise<string> => {
  const url = await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
    }),
    { expiresIn: 300 },
  );

  return url;
};
