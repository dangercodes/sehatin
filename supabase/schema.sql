-- 1. Create Profiles Table
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  name text,
  avatar_url text,
  daily_goal_calories integer default 2400,
  daily_goal_water integer default 8,
  height numeric,
  goal_weight numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  primary key (id)
);

-- 2. Create Meals Table
create table public.meals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  calories integer not null,
  protein integer default 0,
  carbs integer default 0,
  fat integer default 0,
  category text not null check (category in ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Water Logs Table
create table public.water_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Weight Logs Table
create table public.weight_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  weight numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.meals enable row level security;
alter table public.water_logs enable row level security;
alter table public.weight_logs enable row level security;

-- 6. Create RLS Policies
-- Profiles: Users can view and update their own profile
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Meals: Users can manage their own meals
create policy "Users can view own meals" on public.meals for select using (auth.uid() = user_id);
create policy "Users can insert own meals" on public.meals for insert with check (auth.uid() = user_id);
create policy "Users can update own meals" on public.meals for update using (auth.uid() = user_id);
create policy "Users can delete own meals" on public.meals for delete using (auth.uid() = user_id);

-- Water Logs: Users can manage their own water logs
create policy "Users can view own water logs" on public.water_logs for select using (auth.uid() = user_id);
create policy "Users can insert own water logs" on public.water_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own water logs" on public.water_logs for update using (auth.uid() = user_id);
create policy "Users can delete own water logs" on public.water_logs for delete using (auth.uid() = user_id);

-- Weight Logs: Users can manage their own weight logs
create policy "Users can view own weight logs" on public.weight_logs for select using (auth.uid() = user_id);
create policy "Users can insert own weight logs" on public.weight_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own weight logs" on public.weight_logs for update using (auth.uid() = user_id);
create policy "Users can delete own weight logs" on public.weight_logs for delete using (auth.uid() = user_id);

-- 7. Trigger to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'New User'),
    'https://api.dicebear.com/7.x/notionists/svg?seed=' || new.id
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 8. Create Community Posts Table
create table public.community_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  steps integer,
  water integer,
  weight numeric,
  liked_by uuid[] default '{}' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Create Community Group Messages Table
create table public.community_messages (
  id uuid default gen_random_uuid() primary key,
  group_id text not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Enable RLS for Community Tables
alter table public.community_posts enable row level security;
alter table public.community_messages enable row level security;

-- 11. Create Security Policies for Community Tables
create policy "Users can view all community posts" on public.community_posts for select using (true);
create policy "Users can insert own community posts" on public.community_posts for insert with check (auth.role() = 'authenticated');
create policy "Users can update any community posts" on public.community_posts for update using (true);

create policy "Users can view all group messages" on public.community_messages for select using (true);
create policy "Users can insert own group messages" on public.community_messages for insert with check (auth.role() = 'authenticated');
