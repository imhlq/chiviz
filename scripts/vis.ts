// Vis Data Code Generated
interface Interaction {
  process: string;
  p_in: { id: string; E: number };
  p_out: Array<{ id: string; E: number }>;
}

interface CascadeData {
  time: number;
  iters: Interaction[][];
}

interface LogData {
  [setKey: string]: { [cascadeKey: string]: CascadeData };
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

function formatLogData(logs: string): LogData {
    const data: LogData = {};
  
    let currSet: string | null = null;
    let currCascade: string | null = null;
    let currIteration: number | null = null;
  
    logs.split('\n').forEach(line => {
      if (line.trim() === '') return;
  
      if (line.startsWith("C|")) {
        const [i_set, i_cascade, cascade_time] = line.trim().substring(2).split(",");
        if (currSet !== i_set) {
          currSet = i_set;
          data[`Set${currSet}`] = {};
          currCascade = null;
        }
  
        if (currCascade !== i_cascade) {
          currCascade = i_cascade;
          data[`Set${currSet}`][currCascade] = { time: parseFloat(cascade_time), iters: [] };
          currIteration = null;
        }

      } else if (line.startsWith("I|")) {
        const i_iteration = parseInt(line.substring(2), 10);
        if (currIteration !== i_iteration) {
          data[`Set${currSet}`][currCascade!].iters.push([]);
          currIteration = i_iteration;
        }
      } else {
        const elements = line.trim().split(',');
        const process = INVERSE_PROCESS_MAP[elements[0]] || elements[0];
        const p_in_id = INVERSE_PARTICLE_MAP[elements[1]] || elements[1];

        const interaction: Interaction = {
          process: process,
          p_in: { id: p_in_id, E: parseFloat(elements[2]) },
          p_out: []
        };
  
        if (elements.length > 3) {
          for (let i = 3; i < elements.length; i += 2) {
            const p_out_id = INVERSE_PARTICLE_MAP[elements[i]] || elements[i];
            interaction.p_out.push({
              id: p_out_id,
              E: parseFloat(elements[i + 1])
            });
          }
        }
        
        data[`Set${currSet}`][currCascade!].iters[currIteration!].push(interaction);
      }
    });
  
    return data;
}


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
    const data = formatLogData(debugJson.Logs);
    const stats = generateStats(data);
    delete debugJson.Logs;
    debugJson.Results["n_sets"] = Object.keys(debugJson.Results).length;
    debugJson.Results = {
        ...debugJson.Results,
        ...stats
    };
    return debugJson;
}