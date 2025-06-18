'use client';

import { forwardRef, useImperativeHandle, useState } from 'react';

import { useDropzone } from 'react-dropzone';

export const ImageUploader = forwardRef(
  (
    {
      onUpload,
      isPending,
      image,
    }: { onUpload: (data: File) => void; isPending?: boolean; image?: File | null },
    ref,
  ) => {
    const [preview, setPreview] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      resetPreview: () => setPreview(null),
    }));

    const onDrop = (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (!image) {
        setPreview(null);
      }

      const reader = new FileReader();

      reader.onload = () => {
        const base64 = typeof reader.result === 'string' ? reader.result : '';
        setPreview(base64); // Previsualiza la imagen
        onUpload(file);
      };

      reader.readAsDataURL(file);
    };

    const { getRootProps, getInputProps } = useDropzone({
      onDrop,
      accept: { 'image/png': [], 'image/jpg': [], 'image/jpeg': [] },
    });

    return (
      <div
        {...getRootProps()}
        className="cursor-pointer rounded-lg border-2 border-dashed border-gray-400 p-6 text-center"
      >
        <input disabled={isPending} {...getInputProps()} type="file" name="image" id="image" />
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className={`mx-auto h-64 max-w-full ${isPending ? 'opacity-20' : ''}`}
          />
        ) : (
          <p>Arrastra una imagen o haz clic aquí</p>
        )}
      </div>
    );
  },
);

ImageUploader.displayName = 'ImageUploader';

export default ImageUploader;
