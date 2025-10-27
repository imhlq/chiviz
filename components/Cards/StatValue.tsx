import Card from "../Card"

interface StatValue {
    title: string,
    value: number,
    unit?: string,
    min?: number,
    max?: number
    std?: number
}

const formatValue = (value: number) => {
    if (value === null || value === undefined) {
        return "N/A";
    }
    if (Number.isInteger(value)){
        return value.toLocaleString();
    } else {
        return value.toFixed(2);
    }
}

const StatsCard = ( {title, data, unit=null} ) => {
    return (
    <Card title={title} basis="1/4">
        <div className="flex flex-row text-current py-2 gap-3 justify-start">
            <div className="text-5xl font-bold tabular-nums">{formatValue(data.average)}</div>
            {unit && <div className="text-xl font-bold tabular-nums opacity-60">{unit}</div>}
        </div>

        <div className="grid grid-cols-3 gap-x-5 pt-1 justify-start text-sm font-mono min-w-fit">
            <div className="flex flex-row items-start gap-3">
                <div className="text-gray-500 dark:text-gray-400">min</div>
                <div className="font-black text-current text-sm text-bp4-light-gray-500">{formatValue(data.min)}</div>
            </div>
            <div className="flex flex-row items-start gap-3">
                <div className="text-gray-500 dark:text-gray-400">max</div>
                <div className="font-black text-current text-sm text-bp4-light-gray-500">{formatValue(data.max)}</div>
            </div>
            <div className="flex flex-row items-start gap-3">
                <div className="text-gray-500 dark:text-gray-400">std</div>
                <div className="font-black text-current text-sm text-bp4-light-gray-500">{formatValue(data.std_dev)}</div>
            </div>
        </div>
    </Card>
    )
}

export default StatsCard;