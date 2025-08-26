'use client';
import { useEffect, useState } from 'react';

interface Project {
  id: string;
  name: string;
  description: string;
  last_activity: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/projects', {
      headers: { authorization: `Bearer ${token || ''}` },
    })
      .then((r) => (r.ok ? r.json() : { projects: [] }))
      .then((d) => setProjects(d.projects || []));
  }, []);

  return (
    <main>
      <h1>Projects</h1>
      <ul>
        {projects.map((p) => (
          <li key={p.id}>
            <strong>{p.name}</strong>
            <p>{p.description}</p>
            <small>{p.last_activity}</small>
          </li>
        ))}
      </ul>
    </main>
  );
}
