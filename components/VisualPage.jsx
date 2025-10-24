import React, { useCallback, useEffect, useState } from 'react';
import InputSection from './Input';
import OutputSection from './Output';
import VisualHeader from './VisualHeader';
import "./Visual.css";
import { generateVisualization } from '../scripts/vis'; // To be fixed later

function VisualPage({ data, loading }) {

    return (
        <div>
            {loading ? (
                <div className="flex items-center justify-center mt-16">
                    <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">Loading...</div>
                </div>
            ) : 
            data ? (
                <div className='px-8'>
                    <VisualHeader jsonData={data} />
                    <InputSection data={data?.Board} />
                    <OutputSection data={data?.Results} />
                </div>
            ) : (
                <div className="flex mt-16 items-center justify-center">
                    <div className='flex flex-col w-full items-center '>
                        <div className='text-3xl font-bold text-orange-800 dark:text-orange-200 mb-8'>Visual your Chimera</div>
                        <div>No data provided. Please generate a report with data.</div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VisualPage;