import {useEffect, useRef, useState} from "react";
import * as Plot from "@observablehq/plot";
import Card from "../Card";

function format_fraction(value){
    return (Number(value) ).toPrecision(2);
}

function get_data_from_profiles(profiles) {
    const r_max = profiles.r_samples.at(-1);
    const yValues = [
        // {name: "gas", values: profiles.rho_gas},
        {name: "ele", values: profiles.rho_ele},
        {name: "HI", values: profiles.rho_HI},
        {name: "HII", values: profiles.rho_HII},
        {name: "HeI", values: profiles.rho_HeI},
        {name: "HeII", values: profiles.rho_HeII},
        {name: "HeIII", values: profiles.rho_HeIII},
        {name: "H2", values: profiles.rho_H2},
    ];
    const result = profiles.r_samples.flatMap((r, i) => 
        yValues.map(({ name, values }) => ({
            radius: r / r_max,
            element: name,
            value: values[i],
        }))
    )
    return result;
}


function Plot3Density( {
        data,
        width = 600,
        height = 300,
        marginLeft = 50,
        marginTop = 20,
        marginBottom = 30,
    }){
    const containerRef = useRef(null);
    useEffect(() => {
        const plot = Plot.plot({
            marginLeft: marginLeft,
            marginTop: marginTop,
            marginBottom: marginBottom,
            marginRight: 50,
            width: width - marginLeft,
            height: height - marginTop - marginBottom,
            y: {
                grid: true, 
                // transform: (d) => Math.log10(d),
                // domain: [1e-3, 1E3],
                type: "log",
                label: "Density (g/cm^3)",
            },  
            marks: [
                Plot.lineY(data, {x: "radius", y: "value", stroke: "element", tip: true}),
                Plot.text(data, Plot.selectLast({x: "radius", y: "value", z: "element", text: "element", dx: 10}))
                // Plot.areaY(data, {x: "radius", y: "value", fill: "element", fillOpacity: 0.7, title:"element"})
            ]
        });
        containerRef.current.append(plot);
        return () => plot.remove();
    }, [data]);

    return <div ref={containerRef} />;
}


const DensityProfileCard = ( {profiles} ) => {
    const data = get_data_from_profiles(profiles);

    return (
        <Card title="Density Profile">
            <div className="flex flex-col-reverse lg:flex-row gap-2 pt-2">
                <div className="flex flex-col gap-2 grow basis-1/3 h-full justify-center">
                    <div className="flex flex-row font-mono gap-3 items-center">
                        <div className="flex flex-row gap-1 text-md items-center">
                            <div className="text-gray-500 dark:text-gray-400">r_start</div>
                            <div>0.01</div>
                        </div>
                        <div className="flex flex-row gap-1 text-md items-center">
                            <div className="text-gray-500 dark:text-gray-400">r_end</div>
                            <div>1.0</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-y-1 text-sm font-mono p-2 border">
                        <div className="flex flex-row gap-2 items-center">
                            <span className="text-gray-500 dark:text-gray-400">HI</span>
                            <span>{format_fraction(profiles.f_hydrogen)}</span>
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            <span className="text-gray-500 dark:text-gray-400">HII</span>
                            <span>{format_fraction(profiles.f_HII)}</span>
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            <span className="text-gray-500 dark:text-gray-400">HeI</span>
                            <span>{format_fraction(profiles.f_helium)}</span>
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            <span className="text-gray-500 dark:text-gray-400">HeII</span>
                            <span>{format_fraction(profiles.f_HeII)}</span>
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            <span className="text-gray-500 dark:text-gray-400">HeIII</span>
                            <span>{format_fraction(profiles.f_HeIII)}</span>
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            <span className="text-gray-500 dark:text-gray-400">H2</span>
                            <span>{format_fraction(profiles.f_H2)}</span>
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            <span className="text-gray-500 dark:text-gray-400">ele</span>
                            <span>{format_fraction(profiles.f_ele)}</span>
                        </div>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                        <span className="text-gray-500 dark:text-gray-400">baryon</span>
                        <span>{format_fraction(profiles.f_baryon)}</span>
                    </div>
                </div>
            
                <div className="flex justify-end basis-2/3 -mt-6 text-gray-800 dark:text-gray-400">
                    <Plot3Density data={data}/>
                </div>
            </div>
        </Card>
    )
};

export default DensityProfileCard;