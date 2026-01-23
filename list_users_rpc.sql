-- DROP first to avoid conflicts with existing return types
DROP FUNCTION IF EXISTS get_users_list();

-- Create the function with explicit casts
create or replace function get_users_list()
returns table (
  id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz
) 
security definer
set search_path = public
as $$
begin
  return query 
  select 
    au.id, 
    au.email::text,             -- Explicit cast to text
    au.created_at, 
    au.last_sign_in_at          -- This is typically timestamptz
  from auth.users au
  order by au.created_at desc;
end;
$$ language plpgsql;

-- Grant permissions again
grant execute on function get_users_list() to authenticated;
grant execute on function get_users_list() to service_role;
