import { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Badge,
  Drawer,
  Upload,
  Button,
  Image,
  Modal,
  Spin,
  Tooltip,
  Typography,
  notification,
  Empty,
  Tag,
} from 'antd';
import {
  UserOutlined,
  UploadOutlined,
  DeleteOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  PaperClipOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';
import { API_BASE_URL, FILE_BASE_URL } from '@/config/serverApiConfig';
import storePersist from '@/redux/storePersist';

const { Text } = Typography;

// ─── helpers ────────────────────────────────────────────────────────────────

const getAuthToken = () => {
  const auth = storePersist.get('auth');
  return auth?.token || auth?.current?.token || window.localStorage.getItem('token') || null;
};

const isImage = (mimeType = '', filename = '') => {
  if (mimeType.startsWith('image/')) return true;
  const ext = (filename.split('.').pop() || '').toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext);
};

const isPdf = (mimeType = '', filename = '') => {
  if (mimeType === 'application/pdf') return true;
  return (filename.split('.').pop() || '').toLowerCase() === 'pdf';
};

const FileIcon = ({ mimeType, filename }) => {
  if (isImage(mimeType, filename)) return <PaperClipOutlined style={{ color: '#1677ff' }} />;
  if (isPdf(mimeType, filename)) return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
  if ((mimeType || '').includes('word')) return <FileWordOutlined style={{ color: '#2f54eb' }} />;
  return <FileTextOutlined style={{ color: '#8c8c8c' }} />;
};

// ─── main component ──────────────────────────────────────────────────────────

export default function ClientDocumentsDrawer({
  clientId,
  photo,
  name,
  size = 72,
  inlineMode = false,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [badgeVisible, setBadgeVisible] = useState(false);

  // profile photo url
  const imageUrl = useMemo(() => {
    if (!photo) return '';
    if (typeof photo === 'object') {
      const u = photo.url || photo.path || photo.thumbUrl;
      if (u) return u;
    }
    const normalized = String(photo).replace(/\\/g, '/');
    if (/^(https?:)?\/\//i.test(normalized) || normalized.startsWith('data:')) return normalized;
    const base = (FILE_BASE_URL || '').replace(/\/$/, '');
    return `${base}/${normalized.replace(/^\//, '')}`;
  }, [photo]);

  const showImage = Boolean(imageUrl) && !imgError;

  // ─── fetch docs ──────────────────────────────────────────────────────────
  const fetchDocs = async () => {
    if (!clientId) return;
    setLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/client/${clientId}/documents`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) setDocs(data.result || []);
    } catch (e) {
      console.error('Failed to fetch documents', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (drawerOpen) fetchDocs();
  }, [drawerOpen, clientId]);

  useEffect(() => {
    if (inlineMode) fetchDocs();
  }, [inlineMode, clientId]);

  // ─── upload (batch: all files from one picker selection in a single request) ─
  const uploadFiles = async (rawFiles) => {
    if (!clientId || !rawFiles?.length) return;

    const formData = new FormData();
    rawFiles.forEach((file) => {
      formData.append('files', file);
    });

    setUploading(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/client/${clientId}/documents`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        const count = rawFiles.length;
        notification.success({
          message: count > 1 ? `${count} documents uploaded successfully` : 'Uploaded successfully',
          style: { padding: '6px 12px', fontSize: 12 },
          duration: 2,
        });
        setBadgeVisible(true);
        fetchDocs();
      } else {
        notification.error({ message: data.message || 'Upload failed' });
      }
    } catch (e) {
      notification.error({ message: e.message || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const beforeUpload = (file, fileList) => {
    const isLastInBatch = fileList[fileList.length - 1] === file;
    if (isLastInBatch) {
      const remaining = 10 - docs.length;
      if (remaining <= 0) {
        notification.warning({ message: 'Maximum 10 documents allowed per client', duration: 3 });
        return false;
      }
      const batch = fileList.slice(0, remaining);
      if (batch.length < fileList.length) {
        notification.warning({
          message: `Only ${remaining} more file(s) can be uploaded (max 10 total)`,
          duration: 3,
        });
      }
      void uploadFiles([...batch]);
    }
    return false;
  };

  // ─── delete ──────────────────────────────────────────────────────────────
  const handleDelete = (doc) => {
    Modal.confirm({
      title: 'Delete this document?',
      content: doc.original_name,
      okText: 'Delete',
      okType: 'danger',
      centered: true,
      onOk: async () => {
        try {
          const token = getAuthToken();
          const res = await fetch(`${API_BASE_URL}/client/${clientId}/documents/${doc.id}`, {
            method: 'DELETE',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          const data = await res.json();
          if (data.success) {
            notification.success({
              message: 'Document deleted',
              style: { padding: '6px 12px', fontSize: 12 },
              duration: 2,
            });
            setDocs((prev) => prev.filter((d) => d.id !== doc.id));
          } else {
            notification.error({
              message: data.message || 'Delete failed',
              style: { padding: '6px 12px', fontSize: 12, width: 'fit-content' },
            });
          }
        } catch (e) {
          notification.error({
            message: e.message || 'Delete failed',
            style: { padding: '6px 12px', fontSize: 12, width: 'fit-content' },
          });
        }
      },
    });
  };

  // ─── inline render (used inside the Client Details modal) ────────────────
  if (inlineMode) {
    return (
      <div>
        <div style={{ marginBottom: 12 }}>
          <Upload
            beforeUpload={beforeUpload}
            multiple
            showUploadList={false}
            accept="image/*,.pdf,.doc,.docx"
          >
            <Button type="primary" icon={<UploadOutlined />} loading={uploading} size="small">
              Upload Documents
            </Button>
          </Upload>
        </div>

        {loading ? (
          <Spin />
        ) : docs.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<Text type="secondary">No documents uploaded yet</Text>}
          />
        ) : (
          <div>
            {docs.filter((d) => isImage(d.mime_type, d.filename)).length > 0 && (
              <Image.PreviewGroup>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4,1fr)',
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  {docs
                    .filter((d) => isImage(d.mime_type, d.filename))
                    .map((doc) => {
                      const url = `${(FILE_BASE_URL || '').replace(/\/$/, '')}/${doc.path.replace(
                        /^\//,
                        ''
                      )}`;
                      return (
                        <div
                          key={doc.id}
                          style={{ position: 'relative', borderRadius: 6, overflow: 'hidden' }}
                        >
                          <Image
                            src={url}
                            alt={doc.original_name}
                            style={{ width: '100%', height: 80, objectFit: 'cover' }}
                          />
                          <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            style={{
                              position: 'absolute',
                              top: 2,
                              right: 2,
                              opacity: 0.8,
                              padding: '0 4px',
                              minWidth: 'unset',
                              height: 20,
                            }}
                            onClick={() => handleDelete(doc)}
                          />
                        </div>
                      );
                    })}
                </div>
              </Image.PreviewGroup>
            )}
            {docs
              .filter((d) => !isImage(d.mime_type, d.filename))
              .map((doc) => {
                const url = `${(FILE_BASE_URL || '').replace(/\/$/, '')}/${doc.path.replace(
                  /^\//,
                  ''
                )}`;
                return (
                  <div
                    key={doc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 10px',
                      background: '#fafafa',
                      borderRadius: 6,
                      border: '1px solid #f0f0f0',
                      marginBottom: 6,
                    }}
                  >
                    <FileIcon mimeType={doc.mime_type} filename={doc.filename} />
                    <Text style={{ flex: 1, fontSize: 13 }} ellipsis>
                      {doc.original_name}
                    </Text>
                    <Button
                      size="small"
                      icon={<PaperClipOutlined />}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(doc)}
                    />
                  </div>
                );
              })}
          </div>
        )}
      </div>
    );
  }

  // ─── render ──────────────────────────────────────────────────────────────
  const docCount = docs.length;

  return (
    <>
      <Tooltip title="Upload / View Documents" placement="right">
        <div
          onClick={() => {
            setDrawerOpen(true);
            setBadgeVisible(true);
          }}
          style={{
            position: 'relative',
            display: 'inline-block',
            cursor: 'pointer',
            marginBottom: 10,
          }}
        >
          <Badge
            count={badgeVisible ? docCount : 0}
            size="small"
            offset={[-4, 4]}
            style={{ backgroundColor: '#1677ff' }}
          >
            <Avatar
              size={size}
              src={showImage ? imageUrl : undefined}
              icon={
                !showImage && !name ? <UserOutlined style={{ fontSize: size * 0.45 }} /> : undefined
              }
              style={{
                background: showImage ? '#ffffff' : '#1677ff22',
                color: '#1677ff',
                border: '2px solid #d9d9d9',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: size * 0.4,
                lineHeight: `${size}px`,
                minWidth: size,
                minHeight: size,
              }}
              onError={() => {
                setImgError(true);
                return false;
              }}
            >
              {!showImage && name ? String(name).charAt(0).toUpperCase() : null}
            </Avatar>
          </Badge>

          {/* upload icon — half inside, half outside bottom of avatar */}
          <div
            style={{
              position: 'absolute',
              bottom: -13,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#1677ff',
              borderRadius: '50%',
              width: 26,
              height: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #fff',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }}
          >
            <UploadOutlined style={{ color: '#fff', fontSize: 13 }} />
          </div>
        </div>
      </Tooltip>

      {/* Documents drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FolderOpenOutlined style={{ color: '#1677ff', fontSize: 18 }} />
            <span>
              Customer Documents
              {name ? (
                <Text type="secondary" style={{ marginLeft: 8, fontSize: 13 }}>
                  — {name}
                </Text>
              ) : null}
            </span>
          </div>
        }
        open={drawerOpen}
        onClose={() => {
          setBadgeVisible(false);
          setDrawerOpen(false);
        }}
        width={480}
        extra={
          <Upload
            beforeUpload={beforeUpload}
            multiple
            showUploadList={false}
            accept="image/*,.pdf,.doc,.docx"
          >
            <Button type="primary" icon={<UploadOutlined />} loading={uploading} size="small">
              Upload Files
            </Button>
          </Upload>
        }
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              onClick={() => {
                setBadgeVisible(false);
                setDrawerOpen(false);
              }}
            >
              Done
            </Button>
          </div>
        }
      >
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
            <Spin />
          </div>
        ) : docs.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                No documents yet.
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Upload ID proofs, photos, or any customer files.
                </Text>
              </span>
            }
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Image grid */}
            {docs.filter((d) => isImage(d.mime_type, d.filename)).length > 0 && (
              <>
                <Text strong style={{ fontSize: 13, color: '#8c8c8c' }}>
                  IMAGES
                </Text>
                <Image.PreviewGroup>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    {docs
                      .filter((d) => isImage(d.mime_type, d.filename))
                      .map((doc) => {
                        const url = `${(FILE_BASE_URL || '').replace(/\/$/, '')}/${doc.path.replace(
                          /^\//,
                          ''
                        )}`;
                        return (
                          <div
                            key={doc.id}
                            style={{ position: 'relative', borderRadius: 8, overflow: 'hidden' }}
                          >
                            <Image
                              src={url}
                              alt={doc.original_name}
                              style={{
                                width: '100%',
                                height: 100,
                                objectFit: 'cover',
                                borderRadius: 8,
                                border: '1px solid #f0f0f0',
                              }}
                              preview={{ src: url }}
                            />
                            <Tooltip title="Delete">
                              <Button
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                style={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  opacity: 0.85,
                                  padding: '0 4px',
                                  minWidth: 'unset',
                                  height: 22,
                                  fontSize: 11,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(doc);
                                }}
                              />
                            </Tooltip>
                            <div
                              style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'rgba(0,0,0,0.45)',
                                color: '#fff',
                                fontSize: 10,
                                padding: '2px 4px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {doc.original_name}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </Image.PreviewGroup>
              </>
            )}

            {/* Non-image files */}
            {docs.filter((d) => !isImage(d.mime_type, d.filename)).length > 0 && (
              <>
                <Text strong style={{ fontSize: 13, color: '#8c8c8c', marginTop: 8 }}>
                  FILES
                </Text>
                {docs
                  .filter((d) => !isImage(d.mime_type, d.filename))
                  .map((doc) => {
                    const url = `${(FILE_BASE_URL || '').replace(/\/$/, '')}/${doc.path.replace(
                      /^\//,
                      ''
                    )}`;
                    return (
                      <div
                        key={doc.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '8px 12px',
                          background: '#fafafa',
                          borderRadius: 8,
                          border: '1px solid #f0f0f0',
                        }}
                      >
                        <FileIcon mimeType={doc.mime_type} filename={doc.filename} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {doc.original_name}
                          </div>
                          <Tag style={{ marginTop: 2, fontSize: 10 }}>
                            {(doc.mime_type || '').split('/').pop()?.toUpperCase() || 'FILE'}
                          </Tag>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Tooltip title="Download">
                            <Button
                              size="small"
                              icon={<PaperClipOutlined />}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          </Tooltip>
                          <Tooltip title="Delete">
                            <Button
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDelete(doc)}
                            />
                          </Tooltip>
                        </div>
                      </div>
                    );
                  })}
              </>
            )}
          </div>
        )}
      </Drawer>
    </>
  );
}
