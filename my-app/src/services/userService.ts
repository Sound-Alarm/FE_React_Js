import { getUsernameFromToken } from '../utils/jwtUtils';
import axios, { refreshToken } from './axiosConfig';

export interface RegisterForm {
    username: string;
    password: string;
    email: string;
    code: string;
    conveyorBelt: ConveyorBeltRequest;
}
interface LogOutResponse {
    username: string;
}

export interface Role {
    name: string;
    code: string;
}
export interface ConveyorBelt {
    id: string;
    name: string;
    index: number;
    clusters: Clusters[];
}


interface Clusters {
    name: string;
    index: number;
}
export interface ConveyorBeltUser {
    id: string;
    name: string;
    index: number;
    clusters: ClustersUser[];
}


interface ClustersUser {
    name: string;
    index: number;
    teams: TeamsUser[];
}
interface TeamsUser {
    name: string;
    index: number;
}

export interface ConveyorBeltRequest {
    id: string;
    name: string;
    index: number;
    clusters: ClustersRequest[];
}


interface ClustersRequest {
    name: string;
    index: number;
}
const API_URL = 'http://localhost:8080/api/users';

export const userService = {
    getAllRole: async (): Promise<Role[]> => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            const response = await axios.get<Role[]>('/users/role', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error: any) {
            if (error?.response?.status === 403) {
                console.log(error.response.data.message);
            }
            console.error('Error in getNotifications:', {
                status: error?.response?.status,
                message: error?.response?.data?.message || error.message,
                error: error
            });
            throw error;
        }
    },
    getAllConveyorBelt: async (): Promise<ConveyorBelt[]> => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            const response = await axios.get<ConveyorBelt[]>('/conveyor-belts', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error: any) {
            if (error?.response?.status === 403) {
                console.log(error.response.data.message);
            }
            console.error('Error in getNotifications:', {
                status: error?.response?.status,
                message: error?.response?.data?.message || error.message,
                error: error
            });
            throw error;
        }
    },
    register: async (values: RegisterForm): Promise<any> => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/users/register', values, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(response);
            return response.data;
        } catch (error: any) {
            console.error('Error in getNotifications:', {
                status: error?.response?.status,
                message: error?.response?.data?.message || error.message,
                error: error
            });
            throw error;
        }
    },
    logout: async (userName: string): Promise<any> => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/users/logout?userName=${userName}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(response);
            return response.data;
        } catch (error: any) {
            console.error('Error in getNotifications:', {
                status: error?.response?.status,
                message: error?.response?.data?.message || error.message,
                error: error
            });
            throw error;
        }
    },
    getConveyorBeltUser: async (userName: string): Promise<ConveyorBeltUser> => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }
            const response = await axios.get<ConveyorBeltUser>(`/users/conveyorBelt?userName=${userName}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error in getConveyorBeltUser:', {
                status: error?.response?.status,
                message: error?.response?.data?.message || error.message,
                error: error
            });
            throw error;
        }
    }
}

