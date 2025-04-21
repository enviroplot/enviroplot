// lib/projectSchema.ts
import { z } from 'zod';

export const ProjectSchema = z.object({
  projectNumber: z.string().min(1),
  projectName:   z.string().min(2),
  location:      z.string().min(2),
  clientName:    z.string().min(2),
  consultant:    z.string().min(2),
  preparedBy:    z.string().min(2),
  projectDate:   z.coerce.date(),
  siteMap: z.instanceof(File).optional(),
  logo:    z.instanceof(File).optional(),
  coc:     z.instanceof(File).optional(),
});

export type ProjectForm = z.infer<typeof ProjectSchema>;
