
export function format_energy(value) {
    const energy = Number(value);
    if (energy < 1e3) {
        return energy.toFixed(2) + " eV";
    } else if (energy < 1e6) {
        return (energy / 1e3).toFixed(2) + " keV";
    } else if (energy < 1e9) {
        return (energy / 1e6).toFixed(2) + " MeV";
    } else {
        return (energy / 1e9).toFixed(2) + " GeV";
    }
}

export function format_pos(value) {
    return Number(value).toPrecision(2);
}

export function format_commit_hash(hash) {
    return hash.slice(0, 7);
}
