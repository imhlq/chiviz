import Card from "../Card";
import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {useEffect, useRef, useState} from "react";

const PlotInteractionHist = ( {
    data,
    width = 1280,
    height = 500,
    marginLeft = 200,
    marginTop = 20,
    marginBottom = 30,
} ) => {
    const containerRef = useRef(null);
    useEffect(() => {
        let plot = Plot.plot({
            marginLeft: marginLeft,
            marginTop: marginTop,
            marginBottom: marginBottom,
            marginRight: 50,
            width: width - marginLeft,
            height: height - marginTop - marginBottom,
            y: {
                grid: true, 
                label: ""
            },
            x: {
                axis: 'top',
                label: ""
            },
            color: {legend: false},
            marks: [
                Plot.ruleX([0]),
                Plot.barX(data, {x: 'average', y: 'name', fill: "name",
                        channels: {name: 'name', avg:'average', min: "min", max: "max"},
                        sort: {y: "x", reverse:true}, 
                        tip: {format: {name: true, min:true, max:true, stroke:false, x:false, y:false}}}
                    ),
            ],
        });
        containerRef.current.append(plot);
        return () => plot.remove();
    }, [data]);

    return <div ref={containerRef} />;
}


const InteractionCounterCard = ( { data } ) => {
    return ( 
        <Card title="# Interaction">
            <div className="text-gray-800 dark:text-gray-300">
                <PlotInteractionHist data={data} />
            </div>
        </Card>
    );
}
 
export default InteractionCounterCard;