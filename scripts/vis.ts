// Vis Data Code Generated
type CompactCascade = {
  time: number;
  iters: number;
  ints: number;
  parts: number;
  eloss_avg: number;
  eloss_std: number;
  proc: Record<string, number>;

}

interface Interaction {
  process: string;
  p_in: { id: string; E: number };
  p_out: Array<{ id: string; E: number }>;
}

interface Stats {
  average: number | null;
  min: number | null;
  max: number | null;
  std_dev: number | null;
}

const INVERSE_PROCESS_MAP: { [key: string]: string } = {
  'A': 'absorbed/escaped',
  'CpS': 'ComptonScattering',
  'ClS': 'CoulombScattering',
  'PP': 'PairProduction',
  'PI': 'Photoionization',
  'EI_HI': 'EleIonization_HI',
  'EI_HeI': 'EleIonization_HeI',
  'Ex_HI_12': 'Excitation_HI_1s_2p',
  'Ex_HI_13': 'Excitation_HI_1s_3p',
  'ICS': 'InverseComptonScattering',
};

const INVERSE_PARTICLE_MAP: { [key: string]: string } = {
  'e-': 'Electron',
  'p': 'Photon',
  'e+': 'Positron',
};


function statsValue(array: number[]): Stats {
    if (array.length === 0) {
        return { average: null, min: null, max: null, std_dev: null };
    }

    const avg = array.reduce((a, b) => a + b, 0) / array.length;

    const { min_val, max_val } = array.reduce((acc, val) => {
        return {
            min_val: Math.min(acc.min_val, val),
            max_val: Math.max(acc.max_val, val)
        };
    }, { min_val: Infinity, max_val: -Infinity });

    const std_dev = array.length > 1 ? Math.sqrt(array.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / array.length) : 0;

    return {
        average: avg,
        min: min_val,
        max: max_val,
        std_dev: std_dev
    };
}

function extractCompactCascade(debugJson) {
  const cascades: any[] = [];
  for (const k of Object.keys(debugJson)) {
    if (k === 'Results' || k === 'Logs' || k === 'Board' || k === 'Info' ) continue;
    const maybeSet = debugJson[k];
    if (maybeSet && typeof maybeSet === 'object' && maybeSet.Cascades && typeof maybeSet.Cascades === 'object') {
      for (const cascadeKey of Object.keys(maybeSet.Cascades)) {
        const c = maybeSet.Cascades[cascadeKey];
        cascades.push(c);
      }
    }
  }

  return cascades;
}

function generateStats(data: LogData) {
    // Here we compute the stats just as in the Python code.
    const cascade_times: number[] = [];
    const cascade_iters_counts: number[] = [];
    const cascade_interaction_counts: number[] = [];
    const cascade_particle_counts: number[] = [];
    const interaction_energy_losses: number[] = [];
    const iters_energy_losses: number[] = [];
    const cascade_energies: number[][] = [];
    const cascade_interaction_counters: Array<Record<string, number>> = [];
  
    for (const set of Object.values(data)) {
      for (const cascade of Object.values(set)) {
        cascade_times.push(cascade.time);
        cascade_iters_counts.push(cascade.iters.length);
        const iter_counts = cascade.iters.map(iter => 
          iter.filter(ele => ele.process !== "(absorbed/escaped)").length);
        cascade_interaction_counts.push(iter_counts.reduce((a, b) => a + b, 0));
        cascade_interaction_counters.push({});
  
        let iter_particle_counts: number[] = [];
        let iter_energy: number[] = [];
  
        for (const iter of cascade.iters) {
          let interaction_energy_loss: number[] = [];
          let interaction_particle_count: number[] = [];
  
          for (const interaction of iter) {
            const energy_loss = interaction.p_in.E - interaction.p_out.reduce((sum, p) => sum + p.E, 0);
            interaction_energy_losses.push(energy_loss);
            interaction_energy_loss.push(energy_loss);
            interaction_particle_count.push(1);
  
            const process = interaction.process;
            if (cascade_interaction_counters[cascade_interaction_counters.length - 1][process]) {
              cascade_interaction_counters[cascade_interaction_counters.length - 1][process] += 1;
            } else {
              cascade_interaction_counters[cascade_interaction_counters.length - 1][process] = 1;
            }
          }
  
          iter_energy.push(iter.reduce((sum, interaction) => sum + interaction.p_in.E, 0));
          iter_particle_counts.push(interaction_particle_count.reduce((a, b) => a + b, 0));
          iters_energy_losses.push(interaction_energy_loss.reduce((a, b) => a + b, 0));
        }
  
        cascade_particle_counts.push(iter_particle_counts.reduce((a, b) => a + b, 0));
        cascade_energies.push(iter_energy);
      }
    }
  
    // Interaction Counters
    const cascade_interaction_counters_stats: Record<string, number[]> = {};
    const all_interaction_keys = new Set<string>();
  
    for (const cascade of cascade_interaction_counters) {
      Object.keys(cascade).forEach(key => all_interaction_keys.add(key));
    }
  
    all_interaction_keys.forEach(key => {
      cascade_interaction_counters_stats[key] = [];
    });
  
    for (const cascade of cascade_interaction_counters) {
      all_interaction_keys.forEach(key => {
        const value = cascade[key] || 0;
        cascade_interaction_counters_stats[key].push(value);
      });
    }
  
    const cascade_interaction_counters_stats_list = Object.entries(cascade_interaction_counters_stats).map(([key, values]) => {
      return { name: key, ...statsValue(values) };
    });
  
    return {
      cascade_times: statsValue(cascade_times),
      cascade_iters_counts: statsValue(cascade_iters_counts),
      cascade_interaction_counts: statsValue(cascade_interaction_counts),
      cascade_particle_counts: statsValue(cascade_particle_counts),
      interaction_energy_losses: statsValue(interaction_energy_losses),
      iters_energy_losses: statsValue(iters_energy_losses),
      cascade_energies: cascade_energies,
      cascade_interaction_counters: cascade_interaction_counters_stats_list,
    };
}

// Note: In the browser, you would use file input or drag-and-drop to select the files, then handle them accordingly.
export function generateVisualization(debugJson): Record<string, any> {
  if (!debugJson) return debugJson;
  const compactCascade = extractCompactCascade(debugJson);
  if (compactCascade.length === 0) {
    debugJson.Results = debugJson.Results || {};
    debugJson.Results["n_sets"] = debugJson.Results["n_sets"] || 0;
    return debugJson;
  }
  const cascade_times: number[] = [];
  const cascade_iters_counts: number[] = [];
  const cascade_interaction_counts: number[] = [];
  const cascade_particle_counts: number[] = []; // not always present in compact -> keep nulls if missing
  // per-interaction arrays cannot be reconstructed; we'll set aggregated stats from compact
  const interaction_energy_losses: number[] = []; // we don't have per-interaction losses in compact -> leave empty
  const iters_energy_losses: number[] = []; // as above
  const cascade_energies: number[][] = []; // compact may include iter energy list; if not, push empty arrays
  const cascade_proc_counters: Array<Record<string, number>> = [];
  
  for (const cc of compactCascade) {
    // compact schema names in your Python: time, iter_count, interaction_count, eloss_mean, eloss_std, proc
    const t = (cc.time !== undefined) ? Number(cc.time) : (cc.t !== undefined ? Number(cc.t) : null);
    if (t !== null) cascade_times.push(t);

    const iters = cc.iter_count !== undefined ? Number(cc.iter_count) : (cc.iters !== undefined ? Number(cc.iters) : null);
    if (iters !== null) cascade_iters_counts.push(iters);

    const ints = cc.interaction_count !== undefined ? Number(cc.interaction_count) : (cc.ints !== undefined ? Number(cc.ints) : null);
    if (ints !== null) cascade_interaction_counts.push(ints);

    // particle counts may be missing in compact; keep nulls if so
    const parts = cc.particle_count !== undefined ? Number(cc.particle_count) : (cc.parts !== undefined ? Number(cc.parts) : null);
    cascade_particle_counts.push(parts ?? 0);

    // cascade energies: compact might include "energy_list" or "energy_iters" — try to pick one
    if (Array.isArray(cc.energy_list)) {
      cascade_energies.push(cc.energy_list.map(Number));
    } else if (Array.isArray(cc.energy_iters)) {
      cascade_energies.push(cc.energy_iters.map(Number));
    } else {
      // fallback: empty per-cascade energy arrays to keep shape compatible
      cascade_energies.push([]);
    }

    // process counters: cc.proc is expected to be { procNameOrCode: count }
    if (cc.proc && typeof cc.proc === 'object') {
      // normalize keys to string names
      const map: Record<string, number> = {};
      for (const [k, v] of Object.entries(cc.proc)) {
        map[String(k)] = Number(v);
      }
      cascade_proc_counters.push(map);
    } else {
      cascade_proc_counters.push({});
    }

    // We don't have per-interaction eloss arrays in compact; skip filling interaction_energy_losses
  }

  // compute cascade_interaction_counters_stats_list similar to the original generateStats
  const all_interaction_keys = new Set<string>();
  cascade_proc_counters.forEach(obj => Object.keys(obj).forEach(k => all_interaction_keys.add(k)));

  const cascade_interaction_counters_stats_list = Array.from(all_interaction_keys).map(key => {
    // gather values across cascades
    const values: number[] = cascade_proc_counters.map(c => c[key] || 0);
    const stat = statsValue(values);
    return { name: key, ...stat };
  });
  
  const resultStats = {
    cascade_times: statsValue(cascade_times.filter(v => v !== null && !isNaN(v))),
    cascade_iters_counts: statsValue(cascade_iters_counts.filter(v => v !== null && !isNaN(v))),
    cascade_interaction_counts: statsValue(cascade_interaction_counts.filter(v => v !== null && !isNaN(v))),
    cascade_particle_counts: statsValue(cascade_particle_counts.filter(v => v !== null && !isNaN(v))),
    interaction_energy_losses: statsValue(interaction_energy_losses), // empty -> nulls
    iters_energy_losses: statsValue(iters_energy_losses),               // empty -> nulls
    cascade_energies: cascade_energies,
    cascade_interaction_counters: cascade_interaction_counters_stats_list,
  };

  debugJson.Results = debugJson.Results || {};
  debugJson.Results["n_sets"] = debugJson.Results["n_sets"] || (() => {
    // estimate n_sets from compact input if possible
    // if input used Results.sets, we can count sets there:
    if (debugJson.Results && debugJson.Results.sets) {
      return Object.keys(debugJson.Results.sets).length;
    }
    // else attempt to count top-level set keys
    let count = 0;
    for (const k of Object.keys(debugJson)) {
      if (k === 'Board' || k === 'Info' || k === 'Results' || k === 'Logs') continue;
      if (debugJson[k] && typeof debugJson[k] === 'object' && debugJson[k].Cascades) count++;
    }
    return count;
  })();

  debugJson.Results = {
      ...debugJson.Results,
      ...resultStats
  };
  return debugJson;
}