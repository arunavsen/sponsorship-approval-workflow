import { AlertCircle } from 'lucide-react';

interface AlertProps {
  message: string;
}

export default function Alert({ message }: AlertProps) {
  return (
    <div className="flex items-center gap-2 rounded-[7px] border border-danger-soft bg-[#fff7f6] px-3 py-2.5 text-sm font-bold text-danger">
      <AlertCircle size={17} />
      {message}
    </div>
  );
}
