import { useEffect } from 'react';
import { useBackHandler } from '../Context/BackHandlerContext';

export default function useOverrideBackHandler(handler) {
    const { setBackHandler, clearBackHandler } = useBackHandler();

    useEffect(() => {
        if (handler && typeof handler === 'function') {
            setBackHandler(handler);
        }

        return () => {
            clearBackHandler();
        };
    }, [handler]);
}
