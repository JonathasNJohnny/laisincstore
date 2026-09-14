interface LoadingSkeletonProps {
  variant?: 'card' | 'product' | 'text' | 'image';
  className?: string;
}

export function LoadingSkeleton({ variant = 'card', className = '' }: LoadingSkeletonProps) {
  const baseClass = 'skeleton animate-pulse';

  const variants = {
    card: (
      <div className={`${baseClass} ${className} rounded-2xl overflow-hidden bg-branco shadow-sm`}>
        <div className="aspect-square w-full" />
        <div className="p-4 space-y-3">
          <div className="h-4 w-1/4 rounded" />
          <div className="h-5 w-3/4 rounded" />
          <div className="h-4 w-1/2 rounded" />
          <div className="h-6 w-1/3 rounded mt-2" />
        </div>
      </div>
    ),
    product: (
      <div className={`${baseClass} ${className} space-y-4`}>
        <div className="aspect-square w-full rounded-2xl" />
        <div className="space-y-2">
          <div className="h-4 w-1/4 rounded" />
          <div className="h-5 w-3/4 rounded" />
          <div className="h-4 w-1/2 rounded" />
          <div className="h-10 w-1/3 rounded mt-2" />
        </div>
      </div>
    ),
    text: (
      <div className={`${baseClass} ${className} space-y-3`}>
        <div className="h-6 w-1/3 rounded" />
        <div className="h-4 w-full rounded" />
        <div className="h-4 w-5/6 rounded" />
        <div className="h-4 w-4/5 rounded" />
      </div>
    ),
    image: (
      <div className={`${baseClass} ${className} aspect-square w-full rounded-2xl`} />
    ),
  };

  return <>{variants[variant]}</>;
}