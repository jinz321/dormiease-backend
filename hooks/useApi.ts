import { useState, useCallback } from 'react';

interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

/**
 * Custom hook for handling API calls with loading and error states
 * @param apiFunc - The API function to call
 * @returns Object containing data, loading, error states and request function
 */
export function useApi<T = any>(apiFunc: (...args: any[]) => Promise<any>) {
    const [state, setState] = useState<ApiState<T>>({
        data: null,
        loading: false,
        error: null,
    });

    const request = useCallback(
        async (...args: any[]) => {
            setState({ data: null, loading: true, error: null });

            try {
                const response = await apiFunc(...args);
                setState({ data: response.data, loading: false, error: null });
                return response.data;
            } catch (err: any) {
                const errorMessage = err.response?.data?.message || err.message || 'Something went wrong';
                setState({ data: null, loading: false, error: errorMessage });
                throw err;
            }
        },
        [apiFunc]
    );

    const reset = useCallback(() => {
        setState({ data: null, loading: false, error: null });
    }, []);

    return {
        ...state,
        request,
        reset,
    };
}
