import { useEffect, useState } from "react";

export const useHistory = (latest: any | undefined, limit = 256) => {
    const [history, setHistory] = useState([]);
    
    const clearHistory = () => setHistory([])

    useEffect(() => {
        if(latest === undefined) return;

        setHistory(prev => [...prev, latest].slice(-limit));
    }, [latest, limit]);

    return {
        history,
        clearHistory,
    }
};

export default useHistory;