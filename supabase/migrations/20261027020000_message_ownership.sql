-- Only the sender can edit or delete a message. Your partner can still mark it delivered
-- or read, and pin or star it, but never change what you wrote.
create or replace function public.guard_message_update()
returns trigger
language plpgsql
as $$
begin
  if new.couple_id is distinct from old.couple_id
     or new.sender_id is distinct from old.sender_id
     or new.receiver_id is distinct from old.receiver_id
     or new.local_uuid is distinct from old.local_uuid
     or new.created_at is distinct from old.created_at then
    raise exception 'These message fields cannot change' using errcode = '42501';
  end if;

  if auth.uid() is distinct from old.sender_id and (
       new.content is distinct from old.content
       or new.message_type is distinct from old.message_type
       or new.reply_to is distinct from old.reply_to
       or new.edited is distinct from old.edited
       or new.edited_at is distinct from old.edited_at
       or new.deleted is distinct from old.deleted
       or new.deleted_at is distinct from old.deleted_at
       or new.forwarded is distinct from old.forwarded) then
    raise exception 'Only the sender can edit or delete a message' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger guard_message_update
  before update on public.messages
  for each row execute function public.guard_message_update();
