export const getFileExtension = (
  fileName: string,
): 'jpg' | 'png' | 'pdf' | undefined => {
  const [extension] = fileName.split('.').slice(-1);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (extension === undefined) {
    return undefined;
  }

  const extensionLowerCase = extension.toLowerCase();

  if (extensionLowerCase === 'jpeg') {
    return 'jpg';
  }

  if (!['pdf', 'png'].includes(extensionLowerCase)) {
    return undefined;
  }

  // @ts-expect-error Should cast return type
  return extensionLowerCase;
};

export const getFileSUpposedContentType = (
  extension: string,
): string | undefined => {
  if (extension === 'jpg') {
    return 'image/jpeg';
  }
  if (extension === 'png') {
    return 'image/png';
  }
  if (extension === 'pdf') {
    return 'application/pdf';
  }

  return;
};
