import React from 'react';

export function withPrivataProvider<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return (props: P) => {
    // Stub implementation
    return <Component {...props} />;
  };
}

