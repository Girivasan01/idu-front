const REPAYMENT_STATUS_CONFIG = {
  paid: { value: 'paid', label: 'paid', color: 'green', hex: '#52c41a' },
  partial: { value: 'partial', label: 'partial', color: 'orange', hex: '#fa8c16' },
  default: { value: 'default', label: 'default', color: 'red', hex: '#ff4d4f' },
  late: { value: 'late', label: 'late', color: 'gold', hex: '#eab308' },
  pending: { value: 'pending', label: 'pending', color: 'blue', hex: '#1677ff' },
  not_started: { value: 'not_started', label: 'not_started', color: 'default', hex: '#d9d9d9' },
};

const repaymentStatusPriority = ['late', 'default', 'partial', 'paid', 'pending', 'not_started'];

const normalizeStatus = (status) => {
  const normalized = String(status || '').trim().toLowerCase();

  const aliases = {
    partially: 'partial',
    'partially paid': 'partial',
    'late payment': 'late',
    unpaid: 'default',
    'not paid': 'default',
    not_paid: 'default',
    'not started': 'not_started',
    'not-started': 'not_started',
  };

  return aliases[normalized] || normalized || 'not_started';
};

const getRepaymentStatusConfig = (status) => {
  const normalized = normalizeStatus(status);
  return REPAYMENT_STATUS_CONFIG[normalized] || { value: normalized, label: normalized, color: 'default', hex: '#d9d9d9' };
};

const getRepaymentStatusColor = (status) => getRepaymentStatusConfig(status).hex;

const compareRepaymentStatusPriority = (leftStatus, rightStatus) =>
  repaymentStatusPriority.indexOf(normalizeStatus(leftStatus)) -
  repaymentStatusPriority.indexOf(normalizeStatus(rightStatus));

const colors = [
  { value: 'draft', label: 'draft', icon: '📝' },
  { value: 'cancelled', label: 'cancelled', color: 'volcano', icon: '❌' },
  { value: 'sent', label: 'sent', color: 'gold', icon: '✉️' },
  { value: 'refunded', label: 'refunded', color: 'purple', icon: '💰' },
  { value: 'on hold', label: 'On hold', color: 'blue', icon: '🛑' },
  { value: 'accepted', label: 'accepted', color: 'green', icon: '✅' },
  { value: 'declined', label: 'declined', color: 'volcano', icon: '❎' },
  { value: 'rejected', label: 'rejected', color: 'red', icon: '🚫' },
  { value: 'expired', label: 'expired', color: 'orange', icon: '⏰' },
  { value: 'success', label: 'success', color: 'green', icon: '✨' },
  { value: 'failed', label: 'failed', color: 'red', icon: '❌' },
  { value: 'error', label: 'error', color: 'volcano', icon: '⚠️' },
  { value: 'arrived', label: 'arrived', color: 'blue', icon: '🚚' },
  { value: 'unpaid', label: 'unpaid', color: 'volcano', icon: '💵' },
  { value: 'partially', label: 'partially paid', color: 'purple', icon: '💰' },
  { value: 'overdue', label: 'overdue', color: 'red', icon: '💰' },
  { value: 'processing', label: 'processing', color: 'geekblue', icon: '⌛' },
  { value: 'packing', label: 'packing', color: 'orange', icon: '📦' },
  { value: 'shipped', label: 'shipped', color: 'purple', icon: '✈️' },
  { value: 'not started', label: 'not started', icon: '🚫' },
  { value: 'in progress', label: 'in progress', color: 'geekblue', icon: '🔄' },
  { value: 'delayed', label: 'delayed', color: 'orange', icon: '⏰' },
  { value: 'completed', label: 'completed', color: 'green', icon: '✅' },
  { value: 'delivered', label: 'delivered', color: 'magenta', icon: '📦' },
  { value: 'returned', label: 'returned', color: 'red', icon: '🔙' },
  { value: 'new', label: 'new', color: 'blue', icon: '🚀' },
  { value: 'premium', label: 'premium', color: 'gold', icon: '🏆' },
  { value: 'free', label: 'free', color: 'green', icon: '💡' },
  ...Object.values(REPAYMENT_STATUS_CONFIG).map((item) => ({
    value: item.value,
    label: item.label,
    color: item.color,
  })),
];

const statusTagColorList = (tags = []) =>
  tags.map((tag) => {
    const normalized = normalizeStatus(tag);
    const repaymentStatus = REPAYMENT_STATUS_CONFIG[normalized];
    if (repaymentStatus) return repaymentStatus;

    const element = colors.find((obj) => obj?.value?.toLowerCase() === String(tag || '').toLowerCase());
    return element || { value: tag, label: tag };
  });

const tagColor = (status) => {
  const normalized = normalizeStatus(status);
  const repaymentStatus = REPAYMENT_STATUS_CONFIG[normalized];
  if (repaymentStatus) return repaymentStatus;

  const element = colors.find((obj) => obj?.value?.toLowerCase() === String(status || '').toLowerCase());
  return element || { value: status, label: status };
};

export {
  compareRepaymentStatusPriority,
  getRepaymentStatusColor,
  getRepaymentStatusConfig,
  normalizeStatus,
  repaymentStatusPriority,
  statusTagColorList,
  tagColor,
};
