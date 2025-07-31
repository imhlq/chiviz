import React, { useCallback, useEffect, useState } from 'react';
import InputSection from './Input';
import OutputSection from './Output';
import MyDropzone from './Dropzone';
import VisualHeader from './VisualHeader';
import "./Visual.css";
import pako from 'pako';
import { generateVisualization } from '../scripts/vis';

function VisualPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleData = useCallback((data) => {
        console.log(data);
        setData(data);
    }, []);

    const fetchAndProcessGzFile = async (url) => {
        setLoading(true);
        try {
            // Fetch the .gz file as an ArrayBuffer
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.statusText}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const decompressed = pako.inflate(new Uint8Array(arrayBuffer), { to: 'string' });
            const rawJson = JSON.parse(decompressed);
            const processedData = await generateVisualization(rawJson); // Assuming generateVisualization is async
            setData(processedData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const api = "https://xchimera.xhou.me/api/"
    // const api = "http://0.0.0.0:8007/api/"

    useEffect(() => {
        if (id) {
            fetchAndProcessGzFile(`${api}${id}`);
        }
    }
    , [id]);

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
                    <InputSection data={data?.Info} />
                    <OutputSection data={data?.Results} />
                </div>
            ) : (
                <div className="flex mt-16 items-center justify-center">
                    <div className='flex flex-col w-full items-center '>
                        <div className='text-3xl font-bold text-orange-800 dark:text-orange-200 mb-8'>Visual your Chimera</div>
                        <MyDropzone onJsonData={handleData} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default VisualPage;