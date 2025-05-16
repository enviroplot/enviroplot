'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    axios.get('/api/projects').then(res => setProjects(res.data));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Projects</h1>
      <table className="table-auto w-full border">
        <thead>
          <tr>
            <th>Name</th>
            <th>Client</th>
            <th>Consultant</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id} className="hover:bg-gray-100">
              <td><Link href={`/projects/${p.id}`}>{p.name}</Link></td>
              <td>{p.client_name}</td>
              <td>{p.consultant}</td>
              <td>{p.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
