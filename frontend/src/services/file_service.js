import api from './api';

export const fileService = {
    listDirectory: async (path = '/') => {
        const response = await api.get('/files/list', {
            params: { path }
        });
        return response.data;
    }
}