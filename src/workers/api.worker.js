/* eslint-disable no-restricted-globals */

// Direct fetch implementation for the worker
self.onmessage = async (event) => {
    const { id, type, url, method, data, params, headers, baseURL } = event.data;

    if (type === 'API_REQUEST') {
        try {
            // Construct URL with params
            let finalUrl = baseURL ? baseURL + url : url;
            if (params) {
                const searchParams = new URLSearchParams(params);
                finalUrl += (finalUrl.includes('?') ? '&' : '?') + searchParams.toString();
            }

            const isFormData = data instanceof FormData;
            const fetchHeaders = { ...headers };
            
            if (!isFormData) {
              fetchHeaders['Content-Type'] = 'application/json';
            } else {
              delete fetchHeaders['Content-Type']; // Browser will set it correctly with boundary
            }

            const response = await fetch(finalUrl, {
                method: method || 'GET',
                credentials: 'include',
                headers: fetchHeaders,
                body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
            });

            const result = await response.json();

            if (!response.ok) {
                // eslint-disable-next-line no-throw-literal
                throw { 
                    status: response.status, 
                    message: result.message || 'API Error',
                    data: result 
                };
            }

            self.postMessage({ id, type: 'API_SUCCESS', data: result });
        } catch (error) {
            self.postMessage({ 
                id, 
                type: 'API_ERROR', 
                error: error.message || 'Network Error',
                status: error.status || 500,
                data: error.data
            });
        }
    }
};
