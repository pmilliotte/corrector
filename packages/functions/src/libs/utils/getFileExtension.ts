export const getFileExtension = (fileName: string): string | undefined => {
  const [extension] = fileName.split('.').slice(-1);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (extension === undefined) {
    return undefined;
  }

  const extensionLowerCase = extension.toLowerCase();

  return extensionLowerCase === 'jpeg' ? 'jpg' : extensionLowerCase;
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

  return;
};
