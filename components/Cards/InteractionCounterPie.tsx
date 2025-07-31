import Card from "../Card";
import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {useEffect, useRef, useState} from "react";



const PlotInteractionPie = ( {
    data,
    width = 600,
    height = 500,
    marginLeft = 200,
    marginTop = 20,
    marginBottom = 30,
} ) => {
    const containerRef = useRef(null);
    useEffect(() => {
        var svg = d3.select(containerRef.current)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append('g')
        var pie = d3.pie()

        return () => svg.remove();
    }, [data]);

    return <div ref={containerRef} />;
}


const InteractionCounterPieCard = ( { data } ) => {
    return ( 
        <Card title="Interaction" basis="1/2">
            <div>
                <PlotInteractionPie data={data} />
            </div>
        </Card>
    );
}
 
export default InteractionCounterPieCard;