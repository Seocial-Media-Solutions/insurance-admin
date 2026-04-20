import { API } from '../utils/api';

class WorkerClient {
    constructor() {
        this.worker = new Worker(new URL('../workers/api.worker.js', import.meta.url));
        this.pendingRequests = new Map();
        this.requestId = 0;

        this.worker.onmessage = (event) => {
            const { id, type, data, error, status } = event.data;
            const handler = this.pendingRequests.get(id);

            if (handler) {
                if (type === 'API_SUCCESS') {
                    handler.resolve({ data, status });
                } else {
                    handler.reject({ 
                        response: { data, status },
                        message: error 
                    });
                }
                this.pendingRequests.delete(id);
            }
        };
    }

    async directRequest(config) {
        const { url, method, data, params, headers, baseURL } = config;
        try {
            let finalUrl = (baseURL || API) + url;
            if (params) {
                const searchParams = new URLSearchParams(params);
                finalUrl += (finalUrl.includes('?') ? '&' : '?') + searchParams.toString();
            }

            const fetchHeaders = { ...headers };
            // For FormData, let the browser set the Content-Type with boundary
            if (data instanceof FormData) {
                delete fetchHeaders['Content-Type'];
            } else {
                fetchHeaders['Content-Type'] = 'application/json';
            }

            const response = await fetch(finalUrl, {
                method: method || 'GET',
                credentials: 'include',
                headers: fetchHeaders,
                body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
            });

            const result = await response.json();

            if (!response.ok) {
                throw {
                    response: { data: result, status: response.status },
                    message: result.message || 'API Error'
                };
            }

            return { data: result, status: response.status };
        } catch (error) {
            if (error.response) throw error;
            throw {
                response: { data: null, status: 500 },
                message: error.message || 'Network Error'
            };
        }
    }

    request(config) {
        // If data is FormData, bypass worker as it cannot be cloned across postMessage
        if (config.data instanceof FormData) {
            return this.directRequest(config);
        }

        return new Promise((resolve, reject) => {
            const id = this.requestId++;
            this.pendingRequests.set(id, { resolve, reject });

            this.worker.postMessage({
                id,
                type: 'API_REQUEST',
                baseURL: API,
                ...config
            });
        });
    }

    get(url, config = {}) {
        return this.request({ ...config, url, method: 'GET' });
    }

    post(url, data, config = {}) {
        return this.request({ ...config, url, data, method: 'POST' });
    }

    put(url, data, config = {}) {
        return this.request({ ...config, url, data, method: 'PUT' });
    }

    delete(url, config = {}) {
        return this.request({ ...config, url, method: 'DELETE' });
    }

    patch(url, data, config = {}) {
        return this.request({ ...config, url, data, method: 'PATCH' });
    }
}

const workerClient = new WorkerClient();
export default workerClient;
