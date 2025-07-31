import React from "react";

interface CardProps {
    title?: string;
    basis?: string;
    children?: React.ReactNode;  // Add children prop
}

const Card = ( {title, basis, children}: CardProps ) => {
    let basisClass = basis ? `basis-${basis}` : 'basis-1';
    return (
        <div className={`flex flex-auto min-w-fit border shadow-sm rounded-md dark:bg-[#2f343c] dark:border-gray-700 dark:shadow-slate-700/[.7] border-gray-600 ${basisClass}`}>
            <div className="flex flex-col justify-start h-full w-full p-4 sm:p-6 text-gray-800 dark:text-gray-400">
                {title && (<header className="flex flex-row text-lg text-gray-600 dark:text-gray-400 items-center gap-2 outline-0">{title}</header>)}
                {children}
            </div>
        </div>
    )
}

export default Card;