// Vis Data Code Generated

const INVERSE_PROCESS_MAP: { [key: string]: string } = {
  'A': 'absorbed/escaped',

  "EI_HI": 'EleIonization_HI',
  "EI_HeI": 'EleIonization_HeI',
  "EI_HeII": 'EleIonization_HeII',

  "EI_H2": 'EleH2Dissociation',
  "Ex_HI_12": 'Excitation_HI_1s_2p',
  "Ex_HI_13": 'Excitation_HI_1s_3p',
  "Ex_HeI": 'Excitation_HeI_first',

  "ClS": 'CoulombScattering',
  "ICS": 'InverseComptonScattering',
  "PI_HI": 'PhoIonization_HI',
  "PI_HeI": 'PhoIonization_HeI',
  "PI_HeII": 'PhoIonization_HeII',
  "CpS": 'ComptonScattering',
  "CpS_e": 'Ele_ComptonScattering',
  "PP_HI": 'GasPairProduction_Atom_HI',
  "PP_HeI": 'GasPairProduction_Atom_HeI',
  "PP_CMB": 'CMBPairProduction',
  "Ps_HI": 'PositroniumAnnihilation_HI',
  "Ps_HeI": 'PositroniumAnnihilation_HeI',
};

const INVERSE_PARTICLE_MAP: { [key: string]: string } = {
  'e-': 'Electron',
  'p': 'Photon',
  'e+': 'Positron',
};


function statsValue(array: number[]) {
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

function getOverallStats(dataWithCounts: number[]) {
    if (!dataWithCounts || dataWithCounts.length === 0) {
        return [0, 0, 0, 0];
    }

    let totalN = 0;
    let weightedSum = 0;        // For calculating the mean
    let totalSumOfSquares = 0;  // For calculating the standard deviation
    let overallMin = dataWithCounts[0][2];
    let overallMax = dataWithCounts[0][3];

    for (const item of dataWithCounts) {
        const mean = item[0];
        const std = item[1];
        const min = item[2];
        const max = item[3];
        const n = item[4];
        if (n === 0) continue;

        const variance = std * std;
        
        const sumOfSquares = (variance + (mean * mean)) * n;
        
        totalN += n;
        weightedSum += mean * n;
        totalSumOfSquares += sumOfSquares;

        // Update overall min and max
        if (min < overallMin) overallMin = min;
        if (max > overallMax) overallMax = max;
    }

    if (totalN === 0) {
        return [0, 0, 0, 0]; // All groups were empty
    }

    const overallMean = weightedSum / totalN;
    const overallVariance = (totalSumOfSquares / totalN) - (overallMean * overallMean);
    const overallStd = Math.sqrt(Math.max(0, overallVariance));

    return {
      average: overallMean,
      min: overallMin,
      max: overallMax,
      std_dev: overallStd
    };
}

function extractCompactCascade(debugJson) {
  const cascades: any[] = [];
  for (const k of Object.keys(debugJson)) {
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

// Note: In the browser, you would use file input or drag-and-drop to select the files, then handle them accordingly.
export function generateVisualization(debugJson): Record<string, any> {
  if (!debugJson) return debugJson;
  const compactCascade = extractCompactCascade(debugJson.Results);
  console.log(`Processing ${compactCascade.length} cascades for statistics.`);
  if (compactCascade.length === 0) {
    debugJson.Results = debugJson.Results || {};
    debugJson.Results["n_sets"] = 0;
    return debugJson;
  }
  const cascade_times: number[] = [];
  const cascade_iters_counts: number[] = [];
  const cascade_interaction_counts: number[] = [];
  const cascade_particle_counts: number[] = [];
  const interaction_energy_losses: number[] = [];
  const iters_energy_losses: number[] = [];
  const cascade_energies: number[][] = [];
  const cascade_proc_counters: Array<Record<string, number>> = [];
  
  for (const cc of compactCascade) {
    const t = (cc.time !== undefined) ? Number(cc.time) : null;
    if (t !== null) cascade_times.push(t);

    const iters = cc.iter_count !== undefined ? Number(cc.iter_count) : null;
    if (iters !== null) cascade_iters_counts.push(iters);
    
    const ints = cc.intec_count !== undefined ? Number(cc.intec_count) : null;
    if (ints !== null) cascade_interaction_counts.push(ints);

    // particle counts may be missing in compact; keep nulls if so
    const parts = cc.particle_count !== undefined ? Number(cc.particle_count) : null;
    cascade_particle_counts.push(parts ?? 0);

    // cascade energies: compact might include "iter_elist"
    if (Array.isArray(cc.iter_elist)) {
      cascade_energies.push(cc.iter_elist.map(Number));
    } else {
      // fallback: empty per-cascade energy arrays to keep shape compatible
      cascade_energies.push([]);
    }

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

    if (cc.iter_eloss !== undefined) {
      iters_energy_losses.push(cc.iter_eloss.map(Number));
    }

    if (cc.intec_eloss !== undefined) {
      interaction_energy_losses.push(cc.intec_eloss.map(Number));
    }
  }

  // compute cascade_interaction_counters_stats_list similar to the original generateStats
  const all_interaction_keys = new Set<string>();
  cascade_proc_counters.forEach(obj => Object.keys(obj).forEach(k => all_interaction_keys.add(k)));

  const cascade_interaction_counters_stats_list = Array.from(all_interaction_keys).map(key => {
    // gather values across cascades
    const values: number[] = cascade_proc_counters.map(c => c[key] || 0);
    const stat = statsValue(values);
    const proc_name = INVERSE_PROCESS_MAP[key] || key;
    return { name: proc_name, ...stat };
  });
  
  const resultStats = {
    cascade_times: statsValue(cascade_times.filter(v => v !== null && !isNaN(v))),
    cascade_iters_counts: statsValue(cascade_iters_counts.filter(v => v !== null && !isNaN(v))),
    cascade_interaction_counts: statsValue(cascade_interaction_counts.filter(v => v !== null && !isNaN(v))),
    cascade_particle_counts: statsValue(cascade_particle_counts.filter(v => v !== null && !isNaN(v))),
    interaction_energy_losses: getOverallStats(interaction_energy_losses),
    iters_energy_losses: getOverallStats(iters_energy_losses),
    cascade_energies: cascade_energies,
    cascade_interaction_counters: cascade_interaction_counters_stats_list,
  };

  debugJson.Results = debugJson.Results || {};
  debugJson.Results["n_sets"] = debugJson.Results["n_sets"] || (() => {
    // estimate n_sets from compact input if possible
    return debugJson.Board.n_cascade_sets;
  })();
  
  // Temporarily move particles info from the first Set Output into Board for presentation
  // TODO: revisit this when we have multiple sets
  const firstSet = debugJson.Results["0"];
  if (firstSet && firstSet.Output.particles) {
    debugJson.Board.particles = firstSet.Output.particles;
  }

  debugJson.Results = {
      ...debugJson.Results,
      ...resultStats
  };
  return debugJson;
}