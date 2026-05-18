import { useEffect, useMemo, useState } from 'react';
import { Avatar, Modal } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { FILE_BASE_URL } from '@/config/serverApiConfig';

export default function CustomerAvatar({ photo, name, size = 40 }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const imageUrl = useMemo(() => {
    if (!photo) return '';

    if (typeof photo === 'object') {
      const objectUrl = photo.url || photo.path || photo.thumbUrl;
      if (objectUrl) return objectUrl;
    }

    const normalizedPhoto = String(photo).replace(/\\/g, '/');

    if (/^(https?:)?\/\//i.test(normalizedPhoto) || normalizedPhoto.startsWith('data:')) {
      return normalizedPhoto;
    }

    const base = (FILE_BASE_URL || '').replace(/\/$/, '');
    const file = normalizedPhoto.replace(/^\//, '');

    return `${base}/${file}`;
  }, [photo]);

  useEffect(() => {
    setImgError(false);
  }, [imageUrl]);

  const showImage = Boolean(imageUrl) && !imgError;

  return (
    <>
      <Avatar
        size={size}
        src={showImage ? imageUrl : undefined}
        icon={!showImage && !name ? <UserOutlined /> : undefined}
        style={{
          background: showImage ? '#ffffff' : '#1677ff22',
          color: '#1677ff',
          border: '1px solid #f0f0f0',
          cursor: showImage ? 'pointer' : 'default',
          fontWeight: 600,
        }}
        onClick={showImage ? () => setPreviewOpen(true) : undefined}
        onError={() => {
          setImgError(true);
          return false;
        }}
      >
        {!showImage && name ? String(name).charAt(0).toUpperCase() : null}
      </Avatar>

      <Modal
        open={previewOpen}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        width={720}
        centered
      >
        {showImage ? (
          <img
            src={imageUrl}
            alt={name || 'Client photo'}
            style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }}
          />
        ) : null}
      </Modal>
    </>
  );
}
