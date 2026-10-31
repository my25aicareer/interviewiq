import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';
import { buttonStyles } from '@/components/buttonStyles';
import type { ButtonSize, ButtonVariant } from '@/components/buttonStyles';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
}

export default function Button({
  variant,
  size,
  fullWidth,
  className,
  loading = false,
  disabled,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={buttonStyles({ variant, size, fullWidth, className })}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
