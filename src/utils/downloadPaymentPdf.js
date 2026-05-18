import { API_BASE_URL } from '@/config/serverApiConfig';
import storePersist from '@/redux/storePersist';

const getAuthToken = () => {
  const auth = storePersist.get('auth');
  return auth?.token || auth?.current?.token || window.localStorage.getItem('token') || null;
};

export const downloadPaymentPdf = async (paymentId) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/payment/download/${paymentId}`, {
    method: 'GET',
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  });

  if (!response.ok) {
    let message = 'Failed to download payment pdf';
    try {
      const errorPayload = await response.json();
      message = errorPayload?.message || message;
    } catch (error) {
      // Ignore JSON parsing failure and use the default message.
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  const disposition = response.headers.get('Content-Disposition');
  const fileNameMatch = disposition?.match(/filename=([^;]+)/i);
  const fileName = fileNameMatch?.[1]?.replace(/"/g, '') || `payment-${paymentId}.pdf`;

  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};
