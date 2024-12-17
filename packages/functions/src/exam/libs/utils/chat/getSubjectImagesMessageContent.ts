import flatMap from 'lodash/flatMap';
import { Bucket } from 'sst/node/bucket';

import { EXAM_BLANK } from '@corrector/shared';

import { ChatMessageContent } from '../../types';
import { getFileKeyPrefix } from '../getFileKeyPrefix';
import { translations } from '../i18n';
import { listObjectPrefixRawData } from '../s3';

export const getSubjectImagesMessageContent = async ({
  organizationId,
  userId,
  examId,
}: {
  organizationId: string;
  userId: string;
  examId: string;
}): Promise<ChatMessageContent[]> => {
  const subjectKeyPrefix = getFileKeyPrefix({
    organizationId,
    userId,
    examId,
    fileType: EXAM_BLANK,
  });

  const imagesPrefix = `${subjectKeyPrefix}/images/`;

  const imageRawDataList = await listObjectPrefixRawData({
    bucketName: Bucket['exam-bucket'].bucketName,
    prefix: imagesPrefix,
  });

  const imagesIntro: ChatMessageContent = {
    type: 'text' as const,
    text: translations.__('examAnalysis.humanMessage.introduction'),
  };

  const imageMessages = flatMap<string, ChatMessageContent>(
    imageRawDataList,
    (rawData, index) => [
      {
        type: 'text' as const,
        text: translations.__('examAnalysis.humanMessage.page', {
          page: (index + 1).toString(),
        }),
      },
      {
        type: 'image_url' as const,
        image_url: {
          url: `data:image/jpeg;base64,${rawData}`,
        },
      },
    ],
  );

  return [imagesIntro, ...imageMessages];
};
