import useResponsive from '@/hooks/useResponsive';

export default function DashboardLayout({ children }) {
  const { isMobile } = useResponsive();

  return (
    <div
      style={{
        marginLeft: isMobile ? 0 : 140,
        padding:    isMobile ? '0 12px' : '0',
        transition: 'margin-left 0.3s ease',
      }}
    >
      {children}
    </div>
  );
}
