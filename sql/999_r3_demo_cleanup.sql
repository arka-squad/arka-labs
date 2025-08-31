-- Remove R3 demo seed data
BEGIN;

-- remove messages and thread
delete from messages where thread_id = '6ad6df9b-33d9-4232-928c-7faf7b5e1d14';
delete from threads where id = '6ad6df9b-33d9-4232-928c-7faf7b5e1d14';

-- remove document
delete from documents where project_id = '1' and name = 'hello-demo.txt';

-- remove user
delete from users where email = 'owner.r3.demo@arka.local';

COMMIT;
