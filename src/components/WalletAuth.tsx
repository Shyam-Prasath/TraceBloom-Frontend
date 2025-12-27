// WalletAuth.tsx
import { Loader2 } from 'lucide-react';
import React from 'react';
import toast from 'react-hot-toast';

import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from './ui/button';

interface WalletAuthProps {
  role: UserRole;
  email: string;
  disabled?: boolean;
}

export const WalletAuth: React.FC<WalletAuthProps> = ({
  role,
  email,
  disabled,
}) => {
  const { connectWallet, loadingWallet } = useAuth();

  const handleWalletConnect = async () => {
    if (!email || !role) {
      toast.error('Please signup first');
      return;
    }

    await connectWallet(email, role);
  };

  return (
    <div className="flex justify-center">
      <Button
        type="button"
        variant="outline"
        onClick={handleWalletConnect}
        disabled={loadingWallet || disabled}
        className="w-full"
      >
        {loadingWallet ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting Wallet...
          </>
        ) : (
          'Connect Wallet'
        )}
      </Button>
    </div>
  );
};
