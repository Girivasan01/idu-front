import dayjs from 'dayjs';

export function getRepaymentCalendarStyle(item, status) {
  const today = dayjs().startOf('day');
  const itemDate = dayjs(item?.date || item?.dueDate).startOf('day');
  const isToday = itemDate.isValid() && itemDate.isSame(today, 'day');

  console.log('TODAY:', today.format());
  console.log('ITEM DATE:', itemDate.format());
  console.log('IS TODAY:', isToday);

  let backgroundColor;

  if (isToday) {
    backgroundColor = '#1677ff';
  } else if (status === 'paid') {
    backgroundColor = '#52c41a';
  } else if (status === 'default') {
    backgroundColor = '#ff4d4f';
  } else if (status === 'partial') {
    backgroundColor = '#fa8c16';
  } else if (status === 'late') {
    backgroundColor = '#fadb14';
  } else {
    backgroundColor = '#d9d9d9';
  }

  return {
    isToday,
    backgroundColor,
    style: {
      backgroundColor,
      color: isToday ? '#ffffff' : '#000000',
      fontWeight: isToday ? 600 : undefined,
      border: isToday ? '1px solid #1677ff' : undefined,
    },
  };
}
