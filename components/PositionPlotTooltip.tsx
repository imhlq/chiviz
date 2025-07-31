import { TooltipWithBounds } from "@visx/tooltip";

export interface TooltipData {
    title: string;
    index?: number;
    x: number;
    y: number;
    z: number;
}

export interface TooltipHandles {
    mouseLeave: () => void;
    mouseHover: (e, data) => void;
    clearTimeout: () => void;
}

export function useTooltipHandles(
    showTooltip: (args) => void,
    hideTooltip: () => void,
): TooltipHandles {
    let tooltipTimeout: number;
    const mouseLeave = () => {
        tooltipTimeout = window.setTimeout(() => {
            hideTooltip();
        }, 150);
    };
    
  const clearTimeout = () => {
    if (tooltipTimeout) {
      window.clearTimeout(tooltipTimeout);
    }
    };
  
    const mouseHover = (e: React.MouseEvent, data: TooltipData) => {
      clearTimeout();
      showTooltip({
        tooltipData: data,
        tooltipLeft: e.nativeEvent.offsetX,
        tooltipTop: e.nativeEvent.offsetY - 50,
      });
    };
  
    return {
      mouseLeave: mouseLeave,
      mouseHover: mouseHover,
      clearTimeout: clearTimeout,
    };
}


type Props = {
    tooltipOpen: boolean;
    tooltipData?: TooltipData;
    tooltipTop?: number;
    tooltipLeft?: number;
    handles: TooltipHandles;
    showTooltip: (args) => void;
}


export const RenderTooltip = (props: Props) => {
    if (!props.tooltipOpen || !props.tooltipData) {
        return null;
    }

    const data = props.tooltipData;
    const title = data.title;

    const content = (
        <div onMouseMove={() => {
            props.handles.clearTimeout();
            props.showTooltip({
                tooltipData: props.tooltipData,
            });
          }}
          onMouseLeave={()=> props.handles.mouseLeave()}>
            <div className="transition-opacity absolute z-10 py-1 px-2 bg-gray-900 dark:bg-slate-700  rounded-md shadow-sm">
                <span className="text-xs font-medium text-white">
                    {title}
                </span>
                <ul>
                    <div className="list-item text-gray-400">x:{data.x}</div>
                    <div className="list-item text-gray-400">y:{data.y}</div>
                    <div className="list-item text-gray-400">z:{data.z}</div>
                </ul>
            </div>
        </div>
    );
    return (
        <TooltipWithBounds
          style={{ position: "absolute" }}
          left={props.tooltipLeft}
          top={props.tooltipTop}
        >
            <div className="hs-tooltip [--placement:bottom]" role="tooltip">
                {content}
            </div>
        </TooltipWithBounds>
    )
}