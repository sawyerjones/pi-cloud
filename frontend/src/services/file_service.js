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
    },

    createDirectory: async (name, path ='/') => {
        const response = await api.post('/files/mkdir', null, {
            params: { path, name }
        });
        return response.data;
    },

    deleteFile: async (path) => {
        const response = await api.delete('/files/delete', {
            params: { path: path}
        });
        return response.data;
    },

    downloadFile: async (path) => {
        const response = await api.get('/files/download', {
            params: { path },
            responseType: 'blob'
        });
        // download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;

        let filename = path.split('/').pop();
        const contentDisposition = response.headers['Content-Disposition'];
        if (contentDisposition) {
            const match = contentDisposition.match(/filename="(.+)"/);
            if (match) {
                filename = match[1];
            }
        }
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }

    }