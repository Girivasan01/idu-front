import useResponsive from '@/hooks/useResponsive';

export default function DashboardLayout({ children }) {
  const { isMobile } = useResponsive();

  return (
    <div
      style={{
        marginLeft: 0,
        padding: isMobile ? '0 12px' : '0',
      }}
    >
      {children}
    </div>
  );
}
