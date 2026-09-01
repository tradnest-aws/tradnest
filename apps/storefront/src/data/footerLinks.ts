const links = {
  customerServices: [
    { key: 'catalog' as const, path: '/categories' },
    { key: 'quoteRequests' as const, path: '/user/quotes' },
    { key: 'orders' as const, path: '/user/orders' },
    { key: 'returns' as const, path: '/user/returns' },
    { key: 'buyerAccount' as const, path: '/register' },
  ],
  about: [
    { key: 'aboutTradnest' as const, path: '/' },
    { key: 'becomeSupplier' as const, path: '/join-as-seller' },
    { key: 'privacy' as const, path: '#' },
    { key: 'terms' as const, path: '#' },
  ],
  connect: [
    { label: 'LinkedIn', path: 'https://linkedin.com' },
  ],
};

export default links;
