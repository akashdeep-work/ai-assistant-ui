import { useMutation } from '@tanstack/react-query';
import { uploadFile } from '../apis/chat.api';

interface UploadVariables {
  file: File;
  onProgress?: (progress: number) => void;
}

export const useUploadFile = () =>
  useMutation({
    mutationFn: ({ file, onProgress }: UploadVariables) => uploadFile(file, onProgress),
  });