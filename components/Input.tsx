import ParticleCard from "./Cards/ParticleDetails";
import DensityProfileCard from "./Cards/DensityProfile";
import Tag from "./Cards/PropTag";
import Card from "./Card";
import { format_commit_hash } from "../scripts/utils";

const InputSection = ( {data} ) => {
    const commit_hash = format_commit_hash(data.commit_hash);
    
    return (
        <section className="w-full">
            <header className="text-3xl text-center opacity-70 dark:text-white font-black py-4">Input</header>
            
            <div className="flex flex-col gap-2">
                {/* Overview */}
                <Card>
                    <div className="flex flex-row flex-wrap justify-center gap-2">
                        <Tag title="n_cascade_sets" value={data.n_cascade_sets} />
                        <Tag title="Cascades" value={data.n_cascade} />
                        <Tag title="h" value={data.h} />
                        <Tag title="T_cmb_0" value={data.T_cmb_0} />
                        <Tag title="Redshift" value={data.z} />
                        <Tag title="n_bins" value={data.n_bins_r} />
                        <Tag title="Commit" value={commit_hash} type="url"/>
                        <Tag title="Seed" value={data.random_seed} />
                        <Tag title="Created" value={data.Completed} />
                    </div>
                </Card>

                {/* Particles */}
                <Card>
                    <div className="flex flex-row flex-wrap justify-center gap-3">
                        {data.particles.map((particle, index) => (
                            <ParticleCard type={particle.id} energy={particle.E} position_x={particle.x} position_y={particle.y} position_z={particle.z} />
                        ))}
                    </div>
                </Card>

                {/* Density Profile */}
                <DensityProfileCard profiles={data.profiles} />
            </div>
        </section>
    )
}

export default InputSection