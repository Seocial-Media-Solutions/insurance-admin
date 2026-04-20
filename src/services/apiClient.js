import workerClient from './workerClient';

// We maintain the same interface as the old apiClient but use the worker under the hood
const apiClient = {
    get: (url, config) => workerClient.get(url, config),
    post: (url, data, config) => workerClient.post(url, data, config),
    put: (url, data, config) => workerClient.put(url, data, config),
    delete: (url, config) => workerClient.delete(url, config),
    patch: (url, data, config) => workerClient.patch(url, data, config),
    request: (config) => workerClient.request(config)
};

export default apiClient;