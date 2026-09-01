'use client';

import { useEffect } from 'react';

export function HtmlLangSetter() {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = 'he-IL';
      document.documentElement.dir = 'rtl';
    }
  }, []);

  return null;
}
