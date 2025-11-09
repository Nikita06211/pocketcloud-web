'use client';

import { useEffect } from 'react';
import '../lib/mixpanel';

export default function MixpanelProvider() {
  useEffect(() => {
    // Mixpanel is initialized in the imported file
    // This component ensures it loads on the client side
  }, []);

  return null;
}

