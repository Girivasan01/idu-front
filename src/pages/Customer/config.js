import dayjs from 'dayjs';
import { createElement } from 'react';
import CustomerAvatar from '@/components/CustomerAvatar';

const calculateFallbackEndDate = (startDate, term, repaymentType) => {
  if (!startDate || !term || !repaymentType) return null;

  const start = dayjs(startDate);
  const parsedTerm = Number.parseInt(term, 10);
  const normalizedRepaymentType = String(repaymentType).toLowerCase();

  if (!start.isValid() || !Number.isFinite(parsedTerm) || parsedTerm <= 0) return null;

  if (normalizedRepaymentType === 'weekly') {
    return start.add(parsedTerm, 'week');
  }

  if (normalizedRepaymentType === 'daily') {
    return start.add(parsedTerm, 'day');
  }

  if (normalizedRepaymentType === 'monthly emi' || normalizedRepaymentType === 'monthly') {
    return start.add(parsedTerm, 'month');
  }

  return null;
};

const getComputedEndDate = (record) => {
  if (record?.endDate) {
    const stored = dayjs(record.endDate);
    if (stored.isValid()) return stored;
  }

  return calculateFallbackEndDate(record?.startDate, record?.term, record?.repaymentType);
};

const getMapLink = (value, record) => value || record?.map_link || record?.mapLink || '';

const renderMapLink = (linkText) => (value, record) => {
  const mapLink = getMapLink(value, record);

  if (!mapLink) {
    return '-';
  }

  return createElement(
    'a',
    {
      href: mapLink,
      target: '_blank',
      rel: 'noopener noreferrer',
      onClick: (event) => event.stopPropagation(),
    },
    linkText
  );
};

export const fields = {
  // ✅ FIX: pass both `photo` AND `name` so CustomerAvatar can show initials as fallback
  // The render receives (value, record) — value here is record.photo (the filename string)
  photo: {
    label: 'Photo',
    render: (value, record) =>
      createElement(CustomerAvatar, {
        photo: value || record?.photo,  // ✅ FIX: use `value` directly (it IS the photo field)
        name: record?.name,
        size: 36,
      }),
  },
  name: {
    type: 'string',
  },
  address: {
    type: 'string',
  },
  map_link: {
    label: 'Location',
    render: renderMapLink('View'),
    readRender: renderMapLink('Open in Google Maps'),
  },
  phone: {
    type: 'phone',
  },
  email: {
    type: 'email',
  },
  loanAmount: {
    type: 'currency',
  },
  interestRate: {
    type: 'number',
  },
  term: {
    type: 'string',
  },
  startDate: {
    type: 'date',
  },
  collectionTime: {
    label: 'Collection',
    render: (time) => {
      if (!time) return '-';
      return dayjs(time, 'HH:mm:ss').format('hh:mm A');
    },
    sorter: (a, b) => (a?.collectionTime || '').localeCompare(b?.collectionTime || ''),
  },
  endDate: {
    label: 'Ending Date',
    render: (_, record) => {
      const endDate = getComputedEndDate(record);
      return endDate ? endDate.format('DD/MM/YYYY') : '-';
    },
    sorter: (a, b) => {
      const aEndDate = getComputedEndDate(a);
      const bEndDate = getComputedEndDate(b);

      const aValue = aEndDate ? aEndDate.valueOf() : 0;
      const bValue = bEndDate ? bEndDate.valueOf() : 0;

      return aValue - bValue;
    },
  },
  repaymentType: {
    type: 'select',
    options: [
      { value: 'Monthly EMI', label: 'Monthly EMI' },
      { value: 'Weekly', label: 'Weekly' },
      { value: 'Daily', label: 'Daily' },
    ],
  },
  status: {
    type: 'select',
    options: [
      { value: 'active', label: 'Active', color: 'blue' },
      { value: 'paid', label: 'Paid', color: 'green' },
      { value: 'defaulted', label: 'Defaulted', color: 'red' },
    ],
  },
  assigned: {
    type: 'related',
    relation: 'Admin',
    label: 'Assigned Staff',
    render: (text, record) => {
      const assigned = record?.assigned || record?.assignedTo || null;
      if (!assigned) {
        return 'Unknown Staff';
      }

      if (typeof assigned === 'string') {
        return assigned;
      }

      if (typeof assigned === 'object') {
        if (assigned.name || assigned.email || assigned._id) {
          return assigned.name || assigned.email || assigned._id;
        }

        const nested = assigned?.assigned || assigned?.user || assigned?.staff;
        if (nested && typeof nested === 'object') {
          return nested.name || nested.email || nested._id || 'Unknown Staff';
        }

        return JSON.stringify(assigned);
      }

      return 'Unknown Staff';
    },
  },
};
