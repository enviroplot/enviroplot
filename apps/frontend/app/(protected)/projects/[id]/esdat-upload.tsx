'use client';

import { useState } from 'react';
import axios from 'axios';

export default function EsdatUpload({ projectId }: { projectId: string }) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      if (file.name.includes('Sample')) formData.append('sample', file);
      else if (file.name.includes('Chemistry')) formData.append('chemistry', file);
      else if (file.name.includes('Header')) formData.append('header', file);
    });
    formData.append('projectId', projectId);

    try {
      const res = await axios.post('/api/parse-esdat', formData);
      setMessage('Bundle parsed & saved.');
    } catch (err) {
      console.error(err);
      setMessage('Failed to parse or save.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" accept=".csv,.xml" multiple onChange={(e) => setFiles(e.target.files)} />
      <button type="submit">Upload Bundle</button>
      <p>{message}</p>
    </form>
  );
}
