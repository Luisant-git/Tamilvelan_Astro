export default function Loading() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px'
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid #4B2A8F',
          borderTopColor: '#FFD700',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}
      />
      <div style={{ color: '#A89BC8', fontSize: '13px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
        ஏற்றுகிறோம்...
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
