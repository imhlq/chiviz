import Card from "../Card";
import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {useEffect, useRef, useState} from "react";

// Flatten a single set (the Python dictionary) into
// an array of { rs, f, ele, channel } for all deposit types.
function flattenSetData(setData) {
    const n = setData.r_deposition.length;
    const flattened = [];

    for (let i = 0; i < n; i++) {
      const rs = setData.r_deposition[i] / setData.r_deposition[n - 1];
      // Heat: collect each species’s deposit_heat_X
      flattened.push({
        rs: rs,
        f: setData.deposit_heat_HI[i],
        ele: "HI",
        channel: "heat"
      });
      flattened.push({
        rs: rs,
        f: setData.deposit_heat_HeI[i],
        ele: "HeI",
        channel: "heat"
      });
      flattened.push({
        rs: rs,
        f: setData.deposit_heat_HeII[i],
        ele: "HeII",
        channel: "heat"
      });
  
      // Ion: collect deposit_ion_X
      flattened.push({
        rs: rs,
        f: setData.deposit_ion_HI[i],
        ele: "HI",
        channel: "ion"
      });
      flattened.push({
        rs: rs,
        f: setData.deposit_ion_HeI[i],
        ele: "HeI",
        channel: "ion"
      });
      flattened.push({
        rs: rs,
        f: setData.deposit_ion_HeII[i],
        ele: "HeII",
        channel: "ion"
      });
      flattened.push({
        rs: rs,
        f: setData.deposit_ion_H2[i],
        ele: "H2",
        channel: "ion"
      });
  
      // Lyman
      flattened.push({
        rs: rs,
        f: setData.deposit_Ly[i],
        ele: "Ly",
        channel: "lyman"
      });
    }
    return flattened;
  }

const PlotHist = ( {
    data,
    width = 1280,
    height = 360,
    marginLeft = 50,
    marginTop = 20,
    marginBottom = 30,
} ) => {
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
                label: "fraction"
            },
            x: {
                // type: "log",
                tickFormat: (d) => (d).toFixed(2),
                label: "radius",
                nice: true,
                ticks: [0.01, 0.1, 0.5, 1.0]
            },
            color: {legend: true},
            marks: [
                Plot.ruleY([0]),
                Plot.rect(data, { 
                    x1: 'rs', // Start of the rectangle on the x-axis
                    x2: (d) => d.rs * 1.5, // End of the rectangle on the x-axis (adjust as needed)
                    y1: 0, // Start of the rectangle on the y-axis
                    y2: 'f', // End of the rectangle on the y-axis
                    fill: 'ele', 
                    tip: true, // Enable tooltips
                }),
            ]
        });
        d3.select(plot)
            .select("div")
            .style("float", "right")
        containerRef.current.append(plot);
        return () => plot.remove();
    }, [data]);

    return <div ref={containerRef} />;
}


const EnergyDistributionCard = ( { data } ) => {
    const [selectedSetIndex, setSelectedSetIndex] = useState(0);
    const [selectedChannel, setSelectedChannel] = useState('heat');

    const handleSetChange = (event) => {
        setSelectedSetIndex(parseInt(event.target.value, 10));
    };
    const handleChannelChange = (event) => {
        setSelectedChannel(event.target.value);
    };
    const selectedSet = data[selectedSetIndex];
    const flattenedData = flattenSetData(selectedSet);
    console.log(flattenedData);
    const filteredData = flattenedData.filter(item => item.channel === selectedChannel);
    return ( 
        <Card title="Energy Distribution">
            <div className="flex flex-row gap-4">
                <select className="px-4 text-gray-700 bg-white border border-gray-300 rounded-sm shadow-sm appearance-none dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:outline-none dark:focus:ring-blue-400 dark:focus:border-blue-400"
                    onChange={handleSetChange}>
                    {Array.from({ length: data.n_sets }).map((_, index) => (
                        <option key={index} value={index}>Set {index + 1}</option>
                    ))}
                </select>
                <select className="px-4 text-gray-700 bg-white border border-gray-300 rounded-sm shadow-sm appearance-none dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:outline-none dark:focus:ring-blue-400 dark:focus:border-blue-400"
                    onChange={handleChannelChange}>
                    <option value="heat">Heat</option>
                    <option value="ion">Ion</option>
                    <option value="lyman">Lyman</option>
                </select>
            </div>
            <div className="text-gray-800 dark:text-gray-300">
                <PlotHist data={filteredData} />
            </div>
        </Card>
    );
}
 
export default EnergyDistributionCard;