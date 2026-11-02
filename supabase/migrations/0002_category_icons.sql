-- Ikon kategori memakai nama ikon SVG (lihat src/components/icons.tsx), bukan emoji.
alter table public.categories alter column icon set default 'star';

update public.categories set icon = case icon
  when '📚' then 'book'
  when '🎬' then 'video'
  when '🎮' then 'gamepad'
  when '💬' then 'chats'
  when '📞' then 'phone-call'
  when '📖' then 'book-open'
  when '🎨' then 'palette'
  when '🐟' then 'fish'
  when '⚽' then 'ball'
  when '🧹' then 'broom'
  when '🕌' then 'mosque'
  when '👨‍👩‍👧' then 'family'
  when '✏️' then 'pencil2'
  when '⭐' then 'star'
  else icon
end;
