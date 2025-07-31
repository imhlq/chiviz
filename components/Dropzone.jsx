import React, {useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import pako from 'pako';
import { generateVisualization } from '../scripts/vis';

function MyDropzone({ onJsonData }) {
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    
    if (file) {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          let parsedJson = null;

          if (file.name.endsWith('.gz')) {
            // Handling .gz files as ArrayBuffer
            const decompressed = pako.inflate(new Uint8Array(event.target.result), { to: 'string' });
            const rawJson = JSON.parse(decompressed);
            parsedJson = await generateVisualization(rawJson);  // Await if generateVisualization is async
          } else {
            // Handling plain JSON files as text
            const rawJson = JSON.parse(event.target.result);
            parsedJson = await generateVisualization(rawJson);  // Await if generateVisualization is async
          };

          onJsonData(parsedJson);

        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };

      if (file.name.endsWith('.gz')) {
        reader.readAsArrayBuffer(file);  // .gz files are read as ArrayBuffer
      } else {
        reader.readAsText(file);  // Plain JSON files are read as text
      }
    }
  }, [onJsonData]);

  const {getRootProps, getInputProps, 
    isDragActive,
    isFocused,
    isDragAccept,
    isDragReject} = useDropzone({onDrop})

  return (
    <div {...getRootProps()}
      className={`flex w-2/3 min-h-32 items-center justify-center p-2 border-2 border-gray-800 dark:border-gray-300 ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
      <input {...getInputProps()} />
      <p className='text-center text-black dark:text-white'>
        {isDragActive ? "Drop the files here..." : "Drag 'n' drop some files here, or click to select files"}
      </p>
    </div>
  )
}

export default MyDropzone;