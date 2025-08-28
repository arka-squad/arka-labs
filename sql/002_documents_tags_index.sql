alter table documents add column if not exists tags text[] not null default '{}';
alter table documents alter column tags set default '{}';
alter table documents alter column tags set not null;
create index if not exists idx_documents_tags on documents using gin (tags);
create index if not exists idx_documents_created_at on documents (created_at desc);
