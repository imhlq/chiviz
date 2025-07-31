const Tag = ({title, value, type='string'}) => {
    if (value) {
        let labelClass = "text-sm lowercase"
        if (type === 'string') {
            labelClass = "text-sm lowercase"
        } else if (type === 'number') {
            labelClass = "text-sm"
        } else if (type === 'url') {
            labelClass = "text-sm text-blue-600 dark:text-blue-300 hover:underline"
        };
        return ( 
            <span className="flex items-center dark:bg-slate-500/50 py-2 px-4 dark:text-white text-sm rounded shadow-lg select-none gap-2">
                <div className="text-xs lowercase text-gray-500 dark:text-gray-400">{title}</div>
                <div className={labelClass}>{value}</div>
            </span>);
    } else {
        return null;
    }
}

export default Tag;