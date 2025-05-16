import { supabase } from '../services/supabaseClient';

export async function saveParsedResults(projectId: string, parsed: any) {
  for (const sample of parsed.samples) {
    const { data: sampleInserted, error: sampleErr } = await supabase
      .from('samples')
      .insert({
        project_id: projectId,
        sample_id: sample.labSampleId,
        depth: sample.depth,
        collected_at: sample.dateSampled,
        matrix: sample.matrixType,
        location: sample.location // assumed as geometry(Point, 4326) if parsed
      })
      .select()
      .single();

    if (sampleErr) throw sampleErr;

    // Insert measurement chemicals
    for (const meas of sample.measurements || []) {
      const chemRes = await supabase
        .from('chemicals')
        .select('id')
        .ilike('name', meas.chemName)
        .maybeSingle();

      const unitRes = await supabase
        .from('units')
        .select('id')
        .ilike('symbol', meas.unit)
        .maybeSingle();

      const chemical_id = chemRes.data?.id;
      const unit_id = unitRes.data?.id;

      if (!chemical_id || !unit_id) continue; // skip unknown chem/unit

      await supabase.from('chemical_measurements').insert({
        sample_id: sampleInserted.id,
        chemical_id,
        result: parseFloat(meas.result),
        unit_id,
        method: meas.method,
        is_detected: !isNaN(parseFloat(meas.result))
      });
    }
  }
}
