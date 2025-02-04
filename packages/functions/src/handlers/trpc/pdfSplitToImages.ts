import { Resource } from 'sst';

import { savePdfToImages } from '~/libs';
import { authedProcedure } from '~/trpc';

export const pdfSplitToImages = authedProcedure.mutation(async () => {
  await savePdfToImages({
    key: 'premieres.pdf',
    destination: 'test',
    bucketName: Resource['exam-bucket'].name,
  });
});
