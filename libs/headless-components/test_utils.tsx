import React from 'react';

import { render, RenderOptions } from '@testing-library/react';

import { domMax, LazyMotion } from 'framer-motion';

function ProvidersWrapper({ children }: { children: React.ReactElement }) {
  return (
    <LazyMotion features={domMax} strict>
      {children}
    </LazyMotion>
  );
}

function customRender(
  component: React.ReactElement,
  options?: Omit<RenderOptions, 'queries'>,
) {
  return render(component, { wrapper: ProvidersWrapper, ...options });
}

// re-export everything
export * from '@testing-library/react';
// override render method
export { customRender as render };
