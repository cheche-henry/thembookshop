export const formatKES = (amount) => `KES ${Number(amount || 0).toLocaleString('en-KE')}`

export const badgeColor = (badge) => {
  const map = {
    'Best Seller': 'bg-accent-soft text-accent',
    'New': 'bg-brand-100 text-brand-800',
    'New Edition': 'bg-brand-100 text-brand-800',
    'Popular': 'bg-muted-surface text-muted',
    'Exam Prep': 'bg-accent-soft text-accent',
    'Bundle Deal': 'bg-brand-100 text-brand-800',
    'Value Pack': 'bg-brand-100 text-brand-800',
    'Kids Favorite': 'bg-muted-surface text-muted',
    'Set Book': 'bg-brand-100 text-brand-800',
  }
  return map[badge] || 'bg-muted-surface text-muted'
}
