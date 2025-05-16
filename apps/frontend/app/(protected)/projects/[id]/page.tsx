'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import EsdatUpload from './esdat-upload';

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    axios.get(`/api/projects/${id}`).then(res => setProject(res.data));
  }, [id]);

  const handleChange = (e: any) => {
    setProject({ ...project, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    await axios.put(`/api/projects/${id}`, project);
    setEdit(false);
  };

  if (!project) return <p>Loading...</p>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Project: {project.name}</h1>
      <div>
        {edit ? (
          <>
            <input name="name" value={project.name} onChange={handleChange} />
            <input name="client_name" value={project.client_name} onChange={handleChange} />
            <input name="consultant" value={project.consultant} onChange={handleChange} />
            <button onClick={handleSave}>Save</button>
          </>
        ) : (
          <>
            <p><strong>Name:</strong> {project.name}</p>
            <p><strong>Client:</strong> {project.client_name}</p>
            <p><strong>Consultant:</strong> {project.consultant}</p>
            <button onClick={() => setEdit(true)}>Edit</button>
          </>
        )}
      </div>

      <div className="border-t pt-4">
        <h2 className="text-lg font-semibold mb-2">Upload ESdat Bundle</h2>
        <EsdatUpload projectId={project.id} />
      </div>
    </div>
  );
}
