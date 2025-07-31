import { Group } from "@visx/group";
import { Grid } from "@visx/grid";
import { Circle } from "@visx/shape";
import { scaleLinear } from "@visx/scale";
import { useTooltip } from "@visx/tooltip";
import { useMemo } from "react";
import { ParentSize } from "@visx/responsive";
import type { Particle } from '../../schemas/types';
import { RenderTooltip, useTooltipHandles, TooltipData } from "../../../src/components/Graphs./../../packages/xChimera/components/PositionPlotTooltip";

type Props = {
    margin?: { left: number, right: number, top: number, bottom: number };
    particles: Particle[];
}

const defaultMargin = { top: 10, left: 10, right: 0, bottom: 0 };

function PositionGraph ({
    width,
    height,
    margin = defaultMargin,
    particles,
}) {
    const numXTicks = 10;
    const numYTicks = 10;
    const size = Math.min(width - margin.left - margin.right, height - margin.top - margin.bottom);
    const gridSize = 2 / size;
    const marginLeft = (width - size) / 2;
    const domain = (size * gridSize) / 2;

    const xScale = scaleLinear<number>({
        range: [0, size],
        domain: [-domain, domain],
    });
    const yScale = scaleLinear<number>({
        range: [size, 0],
        domain: [-domain, domain],
    });
    const sizeScale = (size: number) => size / gridSize;
    
    const tooltip = useTooltip<TooltipData>();
    const TooltipHandles = useTooltipHandles(tooltip.showTooltip, tooltip.hideTooltip);

    return (
        <div className="relative">
            <svg width={width} height={height}>
                <Group left={marginLeft} top={margin.top}>
                    <Grid 
                      stroke="gray" 
                      opacity={0.35}
                      xScale={xScale}
                      yScale={yScale}
                      numTicksRows={numYTicks}
                      numTicksColumns={numXTicks}
                      width={size}
                      height={size}
                    />

                    <Circle
                        cx={xScale(0)}
                        cy={yScale(0)}
                        r={sizeScale(1)}
                        fill="darkgreen"
                        fillOpacity={0.35}
                        stroke="darkgreen"
                        strokeWidth={1}
                    />
                    
                    {particles.map((d, i) => {
                        const opacity = (tooltip.tooltipData?.index == i) ? 0.75 : 0.25
                        return (
                            <Circle
                              key={`particle-${i}`}
                              cx={xScale(d.PosX ?? 0)}
                              cy={yScale(d.PosY ?? 0)}
                              r={sizeScale(0.05)}
                              fill="gray"
                              fillOpacity={opacity}
                              stroke="gray"
                              strokeWidth={2}
                              onMouseMove={(ev) => TooltipHandles.mouseHover(ev, {
                                title: d.id,
                                index: i,
                                x: d.PosX,
                                y: d.PosY,
                                z: d.PosZ,
                              })}
                              onMouseLeave={()=>TooltipHandles.mouseLeave()}
                            />
                        );
                    })}
                </Group>
            </svg>

            <RenderTooltip
              tooltipOpen={tooltip.tooltipOpen}
              tooltipData={tooltip.tooltipData}
              tooltipLeft={tooltip.tooltipLeft}
              tooltipTop={tooltip.tooltipTop}
              handles={TooltipHandles}
              showTooltip={tooltip.showTooltip}
            />
        </div>
    )
}

export default function PositionPlot ({
    particles
}: Props) {
    return (
        <div className="flex flex-col-reverse lg:flex-row gap-2 pt-2 h-72">
            <div className="flex flex-col grow w-[236px] min-h-[100px] lg:self-auto self-center">
                <div className="lg:flex flex-row justify-center dark:text-gray-400 font-mono hidden">
                    Injected Position
                </div>
                <ParentSize>
                    {({width, height}) => (
                        <PositionGraph
                          width={width}
                          height={height}
                          particles={particles}
                        />
                    )}
                </ParentSize>
            </div>
        </div>
    )
}