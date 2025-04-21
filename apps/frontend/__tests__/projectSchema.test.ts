// __tests__/projectSchema.test.ts
import { ProjectSchema } from '@/lib/projectSchema';

describe('ProjectSchema', () => {
  it('rejects empty fields', () => {
    const res = ProjectSchema.safeParse({});
    expect(res.success).toBeFalsy();
  });

  it('passes valid data', () => {
    const res = ProjectSchema.safeParse({
      projectNumber: 'PR‑001',
      projectName:   'Acme Site',
      location:      '123 Main St',
      clientName:    'Acme Corp.',
      consultant:    'Enviro Inc.',
      preparedBy:    'Olga',
      projectDate:   '2025-04-18',
    });
    expect(res.success).toBeTruthy();
  });
});
