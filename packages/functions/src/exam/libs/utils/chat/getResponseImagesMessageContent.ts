import flatMap from 'lodash/flatMap';
import { Bucket } from 'sst/node/bucket';

import { EXAM_RESPONSE } from '@corrector/shared';

import { ChatMessageContent } from '../../types';
import { getFileKeyPrefix } from '../getFileKeyPrefix';
import { translations } from '../i18n';
import { listObjectPrefixRawData } from '../s3';

export const getResponseImagesMessageContent = async ({
  organizationId,
  userId,
  examId,
  fileId,
}: {
  organizationId: string;
  userId: string;
  examId: string;
  fileId: string;
}): Promise<ChatMessageContent[]> => {
  const fileKeyPrefix = getFileKeyPrefix({
    organizationId,
    userId,
    examId,
    fileType: EXAM_RESPONSE,
    fileId,
  });

  const imagesPrefix = `${fileKeyPrefix}/images/`;

  const imagesIntro: ChatMessageContent = {
    type: 'text' as const,
    text: translations.__('responseAnalysis.humanMessage.pages'),
  };

  const imageRawDataList = await listObjectPrefixRawData({
    bucketName: Bucket['exam-bucket'].bucketName,
    prefix: imagesPrefix,
  });

  const imageMessages = flatMap(imageRawDataList, (rawData, index) => [
    {
      type: 'text' as const,
      text: translations.__('responseAnalysis.humanMessage.page', {
        page: (index + 1).toString(),
      }),
    },
    {
      type: 'image_url' as const,
      image_url: {
        url: `data:image/jpeg;base64,${rawData}`,
      },
    },
  ]);

  return [imagesIntro, ...imageMessages];
};
