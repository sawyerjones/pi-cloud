import api from './api';

export const fileService = {
    listDirectory: async (path = '/') => {
        const response = await api.get('/files/list', {
            params: { path }
        });
        return response.data;
    },

    uploadFile: async (file, path = '/') => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/files/upload', formData, {
            params: { path },
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    }