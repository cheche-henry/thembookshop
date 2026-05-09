export const formatKES = (amount) => `KES ${amount.toLocaleString('en-KE')}`
export const badgeColor = (badge) => {
  const map = {
    'Best Seller':'bg-amber-100 text-amber-700','New':'bg-sky-100 text-sky-700',
    'New Edition':'bg-sky-100 text-sky-700','Popular':'bg-purple-100 text-purple-700',
    'Exam Prep':'bg-red-100 text-red-700','Bundle Deal':'bg-brand-100 text-brand-700',
    'Value Pack':'bg-brand-100 text-brand-700','Kids Favorite':'bg-pink-100 text-pink-700',
  }
  return map[badge] || 'bg-gray-100 text-gray-600'
}
