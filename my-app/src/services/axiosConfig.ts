import axios from 'axios';

// Định nghĩa interface cho response
interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    username: string;
    role: string;
}

// Tạo instance axios với cấu hình mặc định
const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000 // 10 seconds timeout
});

// Hàm refresh token
export const refreshToken = async (): Promise<string> => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
            handleAuthError('No refresh token found');
            throw new Error('No refresh token found');
        }
        // console.log('refreshToken', refreshToken);
        const response = await api.post<LoginResponse>('/users/refresh-token', { refreshToken });

        // Lưu thông tin mới vào localStorage
        const { accessToken, username, role } = response.data;

        // Lưu thông tin vào localStorage
        saveAuthData(accessToken, username, role);

        return accessToken;
    } catch (error) {
        console.log('error', error);
        handleAuthError(error);
        throw error;
    }
};

// Hàm xử lý lỗi authentication
const handleAuthError = (error: unknown): void => {
    console.error('Authentication error:', error);
    localStorage.clear();
    // window.location.href = '/login';
};

// Hàm lưu thông tin authentication
const saveAuthData = (
    accessToken: string,
    username: string,
    role: string
): void => {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('username', username);
    localStorage.setItem('role', role);
};

// Interceptor cho request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor cho response
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Kiểm tra nếu là lỗi 401 và chưa thử refresh token
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const newAccessToken = await refreshToken();

                // Cập nhật header với token mới
                if (originalRequest.headers) {
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                }

                // Thử lại request gốc
                return api(originalRequest);
            } catch (refreshError) {
                handleAuthError(refreshError);
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Export các hàm tiện ích
export const getAuthToken = (): string | null => localStorage.getItem('accessToken');
export const getRefreshToken = (): string | null => localStorage.getItem('refreshToken');
export const isAuthenticated = (): boolean => !!getAuthToken();

// Export instance axios đã cấu hình
export default api;