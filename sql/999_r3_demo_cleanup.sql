BEGIN;
delete from agent_events where agent='demo_agent_r3' and event='metrics_run';
delete from messages where thread_id in (select id from threads where title='R3 Demo Thread');
delete from threads where title='R3 Demo Thread';
delete from agents where name='demo_agent_r3';
delete from project_docs where name='hello-demo.txt';
delete from projects where name='R3 Demo Project';
delete from users where email='owner.r3.demo@arka.local';
COMMIT;
