// __tests__/ProjectSetupForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewProject from '@/app/(protected)/projects/new/page';
import { supabase } from '@/lib/supabaseClient';
import { vi } from 'vitest';

// mock Supabase
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'x/file.pdf' } }),
        getPublicUrl: () => ({ data: { publicUrl: 'http://storage/file.pdf' } }),
      }),
    },
    from: () => ({ insert: vi.fn().mockResolvedValue({}) }),
  },
}));

describe('Project setup form', () => {
  it('uploads files and saves', async () => {
    render(<NewProject />);

    await userEvent.type(screen.getByLabelText(/Project Name/), 'Test');
    await userEvent.type(screen.getByLabelText(/Project ID/), 'T‑01');
    await userEvent.type(screen.getByLabelText(/Site Address/), '123');
    await userEvent.type(screen.getByLabelText(/^Client/), 'ACME');
    await userEvent.type(screen.getByLabelText(/^Consultant/), 'Enviro');
    await userEvent.type(screen.getByLabelText(/Prepared By/), 'QA');
    await userEvent.type(screen.getByLabelText(/^Date/), '2025-04-18');

    const file = new File(['dummy'], 'map.pdf', { type: 'application/pdf' });
    await userEvent.upload(screen.getByLabelText(/^Site Map/), file);

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() =>
      expect(
        (supabase.from as any)().insert
      ).toHaveBeenCalledWith(expect.objectContaining({
        site_map_url: 'http://storage/file.pdf',
      }))
    );
  });
});
