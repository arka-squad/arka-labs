-- Seed R3 demo account, chat thread, and document
BEGIN;

-- insert owner user
insert into users (email, role, password_hash)
values ('owner.r3.demo@arka.local','owner','$2a$10$vBQLa93yYRsimJx4A9V4S.lCsGvXD5oi.t2IZDBkXkAzcMeRCkYsS');

-- create demo chat thread
insert into threads (id, project_id, title)
values ('6ad6df9b-33d9-4232-928c-7faf7b5e1d14','1','R3 Demo Thread');

-- add messages to thread
insert into messages (thread_id, role, content)
values
  ('6ad6df9b-33d9-4232-928c-7faf7b5e1d14','user','Hello from demo user'),
  ('6ad6df9b-33d9-4232-928c-7faf7b5e1d14','assistant','Hi, this is demo assistant');

-- add demo document
insert into documents (project_id, name, mime, size, storage_key, tags)
values ('1','hello-demo.txt','text/plain',14,'demo/hello-demo.txt',ARRAY['demo']);

COMMIT;
