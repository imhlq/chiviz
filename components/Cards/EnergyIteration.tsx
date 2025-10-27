import {useEffect, useRef, useState} from "react";
import * as Plot from "@observablehq/plot";
import Card from "../Card";

const transformData = (data) => {
    const result = [];
    data.forEach((subArray, t) => {
        subArray.forEach((value, x) => {
            result.push({x: x, y: value, cascade: t})
        })
    });
    return result;
}

function PlotEnergyLine( {
        data,
        width = 1280,
        height = 350,
        marginLeft = 100,
        marginTop = 30,
        marginBottom = 40,
    }){
    const containerRef = useRef(null);
    useEffect(() => {
        const plot = Plot.plot({
            marginLeft: marginLeft,
            marginTop: marginTop,
            marginBottom: marginBottom,
            marginRight: 20,
            width: width - marginLeft,
            height: height - marginTop - marginBottom,
            y: {
                grid: true, 
                // type: "log",
                label: "Energy (eV)",
                nice: true,
            },  
            x: {
                grid: true,
                label: "Iteration"
            },
            marks: [
                Plot.gridX({strokeDasharray: "4 4"}),
                Plot.gridY({strokeDasharray: "4 4"}),
                Plot.lineY(data, {x: "x", y: "y", stroke: "cascade"}),
                Plot.ruleX(data, Plot.pointerX({x: "x", py: "y", stroke: "red"})),
                Plot.dot(data, Plot.pointerX({x: "x", y: "y", stroke: "red"})),
                Plot.tip(data, Plot.pointerX({x: "x", y: "y", dy: -10, stroke: "cascade"}))
            ]
        });
        containerRef.current.append(plot);
        return () => plot.remove();
    }, [data]);

    return <div ref={containerRef} />;
}


const EnergyIterationCard = ( {data} ) => {

    return (
        <Card title="Total Energy">
            <div className="flex text-gray-800 dark:text-gray-400">
                <PlotEnergyLine data={transformData(data)}/>
            </div>
        </Card>
    )
};

export default EnergyIterationCard;