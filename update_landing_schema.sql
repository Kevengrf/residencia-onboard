-- Landing Images Table
create table if not exists landing_images (
  id uuid primary key default uuid_generate_v4(),
  image_url text not null,
  order_index int default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table landing_images enable row level security;

create policy "Landing images are viewable by everyone"
  on landing_images for select
  using ( is_active = true );

create policy "Management can manage landing images"
  on landing_images for all
  using ( 
    auth.uid() in (
      select id from profiles where role in ('management', 'support')
    )
  );

-- Seed Data (using local public/carousel paths)
insert into landing_images (image_url, order_index) values 
('/carousel/1750271394343.jpeg', 1),
('/carousel/1762460232945.jpeg', 2),
('/carousel/1763128926053.jpeg', 3),
('/carousel/1764770398311.jpeg', 4),
('/carousel/1765913601518.jpeg', 5),
('/carousel/1765999788211.jpeg', 6),
('/carousel/1766162293992.jpeg', 7),
('/carousel/1767904758717.jpeg', 8),
('/carousel/1767904764703.jpeg', 9);
