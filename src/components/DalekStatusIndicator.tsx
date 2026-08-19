export const DalekStatusIndicator = ({ status }: { status: string }) => (
  <div className={`text-[10px] uppercase tracking-widest ${status === 'connected' ? 'text-green-500' : 'text-red-500'}`}>
    {status === 'connected' ? '● SECURE' : '○ OFFLINE'}
  </div>
);