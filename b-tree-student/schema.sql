create table if not exists public.sinh_vien (
  mssv varchar(8) primary key,
  ho_ten text not null,
  gioi_tinh text not null,
  ngay_sinh text not null,
  que_quan text not null
);

alter table public.sinh_vien enable row level security;

create policy "public can read sinh_vien"
on public.sinh_vien
for select to anon
using (true);

create policy "public can insert sinh_vien"
on public.sinh_vien
for insert to anon
with check (true);

create policy "public can delete sinh_vien"
on public.sinh_vien
for delete to anon
using (true);

alter table public.sinh_vien
add column khoa text;