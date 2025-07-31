import StatsCard from "./Cards/StatValue"
import EnergyDistributionCard from "./Cards/EnergyDistribution";
import EnergyIterationCard from "./Cards/EnergyIteration";
import InteractionCounterCard from "./Cards/InteractionCounter";
import InteractionCounterPieCard from "./Cards/InteractionCounterPie";


const OutputSection = ({data}) => {
    return (
        <section className="w-full">
            <header className="text-3xl text-center opacity-70 dark:text-white font-black py-4">Result</header>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-6 justify-center">
                <div className="col-span-full flex flex-row flex-wrap gap-2">
                    <StatsCard title="Cascade Runtime" data={data.cascade_times} unit="s"/>
                    <StatsCard title="# Iteration Per Cascade" data={data.cascade_iters_counts} />
                    <StatsCard title="# Interaction Per Cascade" data={data.cascade_interaction_counts} />
                    <StatsCard title="# Particles Per Cascade" data={data.cascade_particle_counts} />
                    <StatsCard title="Energy Loss Per Interaction" data={data.interaction_energy_losses} unit="eV"/>
                    <StatsCard title="Energy Loss Per Iteration" data={data.iters_energy_losses} unit="eV"/>
                </div>

                <div className="col-span-full">
                    <EnergyDistributionCard data={data} />
                </div>

                <div className="col-span-full">
                    <EnergyIterationCard data={data.cascade_energies} />
                </div>

                <div className="col-span-full">
                    <InteractionCounterCard data={data.cascade_interaction_counters} />
                </div>

                {/* <div className="col-span-full">
                    <InteractionCounterPieCard data={data.cascade_interaction_counters}/>
                </div> */}
                
            </div>
        </section>
    )
};

export default OutputSection;