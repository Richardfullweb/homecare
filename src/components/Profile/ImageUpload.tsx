import React, { useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '../ui/toast';

interface ImageUploadProps {
  onUploadSuccess: (url: string) => void;
  initialImageUrl?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUploadSuccess, initialImageUrl }) => {
  const [imageUrl, setImageUrl] = useState<string>(initialImageUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const storage = getStorage();
      const storageRef = ref(storage, `profile-images/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      onUploadSuccess(downloadURL);
    } catch (error) {
      showToast({
        title: 'Erro',
        description: 'Falha ao fazer upload da imagem',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Foto de Perfil
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading}
        className="w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-lg file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
      {isUploading && (
        <p className="text-sm text-gray-500">Enviando imagem...</p>
      )}
    </div>
  );
};

export default ImageUpload;
