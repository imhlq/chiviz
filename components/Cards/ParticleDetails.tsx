import { format_energy, format_pos } from "../../scripts/utils";
import "./ParticleDetails.css"


function getGradient(type: string) {
    switch (type) {
        case "Electron":
            return "bg-gradient-to-r from-gray-700 to-purple-300";
        case "Positron":
            return "bg-gradient-to-r from-gray-700 to-teal-500";
        default:
            return "bg-gradient-to-r from-gray-700 to-green-500";
    }
}

const ParticleCard = ({type, energy, position_x, position_y, position_z}) => {
    return (
        <div className="min-w-[320px] min-h-24 rounded-sm shadow text-sm border border-gray-600">
            <div className={`particle-parent h-full flex flex-row p-2 justify-between`}>
                {/* <div className="particle-header"></div> */}
                <div className="w-3/4">
                    <div className="flex flex-row text-3xl items-center outline-0 pb-2">{type}</div>
                    <div className="flex flex-row items-start gap-2">
                        <div className="text-gray-500 dark:text-gray-400">Initial Energy</div>
                        <div className="font-black text-lg">{format_energy(energy)}</div>
                    </div>
                </div>

                <div className="w-1/4">
                    <div className="flex flex-row items-start gap-3">
                        <div className="text-gray-500 dark:text-gray-400">x</div>
                        <div className="font-black text-current text-sm">{format_pos(position_x)}</div>
                    </div>
                    <div className="flex flex-row items-start gap-3">
                        <div className="text-gray-500 dark:text-gray-400">y</div>
                        <div className="font-black text-current text-sm">{format_pos(position_y)}</div>
                    </div>
                    <div className="flex flex-row items-start gap-3">
                        <div className="text-gray-500 dark:text-gray-400">z</div>
                        <div className="font-black text-current text-sm">{format_pos(position_z)}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ParticleCard;