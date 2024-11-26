import axios from 'axios';

const httpClient = axios.create();

export const uploadFileOnS3 = async ({
  fields,
  file,
  url,
}: {
  fields: Record<string, string>;
  file: File;
  url: string;
}): Promise<void> => {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append('Content-Type', file.type);
  formData.append('file', file);
  await httpClient.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
