import Card from "../Card";
import * as d3 from "d3";
import {useEffect, useRef, useState} from "react";
import "./InteractionCounterPie.css";

const PlotInteractionPie = ( {
    data,
    width = 600,
    height = 500,
} ) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!data || data.length === 0 || !containerRef.current) {
            return;
        }

        // --- 1. Clear previous content ---
        d3.select(containerRef.current).selectAll("*").remove();

        // --- 2. Setup Dimensions ---
        
        // **ADJUST THESE PADDINGS TO PREVENT CLIPPING**
        // This is the space we reserve for labels.
        // If labels go "out of canvas", increase component `height`
        // or increase these padding values.
        const horizontalPadding = 100; // Space for labels on left/right
        const verticalPadding = 40;   // Space for labels on top/bottom
        
        // This is the vertical pixel distance between labels
        const yPadding = 18; 

        // Calculate actual radius based on padding
        const innerWidth = width - 2 * horizontalPadding;
        const innerHeight = height - 2 * verticalPadding;
        const radius = Math.min(innerWidth, innerHeight) / 2 - 60;

        // Ensure radius is positive
        if (radius <= 0) return; 

        // --- 3. Create SVG Container ---
        const svg = d3.select(containerRef.current)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        // --- 4. Create Tooltip Div ---
        const tooltip = d3.select(containerRef.current)
            .append("div")
            .attr("class", "tooltip");

        // --- 5. Color Scale ---
        const color = d3.scaleOrdinal()
            .domain(data.map(d => d.name))
            .range(d3.schemeDark2);

        // --- 6. The Pie Generator ---
        const pie = d3.pie()
            .sort(null) // Keep original data order
            .value(d => d.average); 

        const data_ready = pie(data);

        // --- 7. The Arc Generators ---
        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);
        
        const outerArc = d3.arc()
            .innerRadius(radius + 10) // "Elbow" position
            .outerRadius(radius + 10);

        // --- 8. NEW: Calculate Initial Label Positions ---
        // We augment data_ready with positioning info
        data_ready.forEach(d => {
            d.midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            d.isLeft = d.midAngle > Math.PI;
            d.posA = arc.centroid(d); // Slice start point
            d.posB = outerArc.centroid(d); // Elbow point
            d.initialY = d.posB[1]; // Store initial Y
        });

        // --- 9. NEW: De-conflict Logic (The Algorithm) ---
        
        // Separate and sort
        const leftLabels = data_ready
            .filter(d => d.isLeft)
            .sort((a, b) => a.initialY - b.initialY);
            
        const rightLabels = data_ready
            .filter(d => !d.isLeft)
            .sort((a, b) => a.initialY - b.initialY);

        // De-conflict Right Side
        let lastY = -Infinity;
        rightLabels.forEach(d => {
            let y = d.initialY;
            if (y < lastY + yPadding) {
                y = lastY + yPadding;
            }
            d.labelY = y; // Store the new, adjusted Y
            lastY = y;
        });

        // De-conflict Left Side
        lastY = -Infinity;
        leftLabels.forEach(d => {
            let y = d.initialY;
            if (y < lastY + yPadding) {
                y = lastY + yPadding;
            }
            d.labelY = y; // Store the new, adjusted Y
            lastY = y;
        });
        
        // --- 10. Bind Data and Draw Slices ---
        const slices = svg.selectAll("g.slice")
            .data(data_ready)
            .enter()
            .append("g")
            .attr("class", "slice");

        slices.append("path")
            .attr("d", arc)
            .attr("fill", d => color(d.data.name))
            .attr("stroke", "white")
            .style("stroke-width", "2px");

        // --- 11. Draw Leader Lines (Polylines) ---
        const lineEndX = radius + 30; // Where the horizontal line ends
        slices.append('polyline')
            .attr('stroke', d => color(d.data.name))
            .style('fill', 'none')
            .attr('stroke-width', 1.5)
            .attr('points', d => {
                // posA is the slice
                // posB_adjusted uses the original X but the new *adjusted* Y
                const posB_adjusted = [d.posB[0], d.labelY];
                // posC is the end of the horizontal line
                const posC = [ (d.isLeft ? -1 : 1) * lineEndX, d.labelY ]; 
                return [d.posA, posB_adjusted, posC];
            });

        // --- 12. Add Label Groups (Text + tspans) ---
        const textX = radius + 35; // 5px padding from end of line
        const labelGroups = slices.append('g')
            .attr('class', 'pie-label-group')
            .attr('transform', d => {
                const x = (d.isLeft ? -1 : 1) * textX;
                const y = d.labelY; // Use the adjusted Y
                return `translate(${x}, ${y})`;
            })
            // Add tooltip events
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1);
            })
            .on("mousemove", (event, d) => {
                const { name, average, min, max } = d.data;
                tooltip.html(`
                    <strong>${name}</strong><br/>
                    Average: ${average}<br/>
                    Min: ${min}<br/>
                    Max: ${max}
                `);
                const [x, y] = d3.pointer(event, containerRef.current);
                tooltip
                    .style("left", (x + 15) + "px")
                    .style("top", (y) + "px");
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
            });

        const labelText = labelGroups.append('text')
            .attr('dy', '0.35em') // Vertical alignment
            .style('text-anchor', d => (d.isLeft ? 'end' : 'start'));

        labelText.append('tspan')
            .attr('class', 'pie-label-name')
            .attr('fill', d => color(d.data.name))
            .text(d => d.data.name);


        // --- 13. Cleanup function ---
        return () => {
            d3.select(containerRef.current).selectAll("*").remove();
        };

    }, [data, width, height]);

    return <div ref={containerRef} className="plot-container" />;
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