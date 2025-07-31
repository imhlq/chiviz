import React from 'react';

const DownloadButton = ( {jsonData, fileName} ) => {
    const downloadFile = () => {
        const jsonStr = JSON.stringify(jsonData, null, 2); // Convert JSON data to string
        const blob = new Blob([jsonStr], { type: 'application/json' }); // Create a Blob from the JSON string
        const url = URL.createObjectURL(blob); // Create a URL for the Blob

        // Create a temporary link element
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.json`; // Set the file name
        document.body.appendChild(link); // Append the link to the body

        // Trigger the download by simulating a click
        link.click();

        // Cleanup: remove the link element and revoke the object URL
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <button onClick={downloadFile}
            className="hs-tab-active:font-semibold hs-tab-active:border-blue-600 hs-tab-active:text-blue-600 py-4 px-1 inline-flex items-center gap-2 border-b-[3px] border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-blue-600" id="download-tab-item" data-hs-tab="#download-btn" aria-controls="download-btn" role="button">
                Download
        </button>
    );
}

const VisualHeader = ( {jsonData} ) => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    return (
        <div className="border-gray-200 dark:border-gray-700">
            <nav className="-mb-0.5 flex justify-start space-x-6" aria-label="Tabs" role="tablist">
            <button type="button" className="hs-tab-active:font-semibold hs-tab-active:border-blue-600 hs-tab-active:text-blue-600 py-4 px-1 inline-flex items-center gap-2 border-b-[3px] border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-blue-600 active" id="result-tab-item" data-hs-tab="#result-tab" aria-controls="result-tab" role="tab">
                Results
            </button>
            <button type="button" className="hs-tab-active:font-semibold hs-tab-active:border-blue-600 hs-tab-active:text-blue-600 py-4 px-1 inline-flex items-center gap-2 border-b-[3px] border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-blue-600" id="detail-tab-item" data-hs-tab="#detail-tab" aria-controls="detail-tab" role="tab">
                Details
            </button>
            <DownloadButton jsonData={ jsonData } fileName={ id }/>
            </nav>
        </div>
    )
}

export default VisualHeader;