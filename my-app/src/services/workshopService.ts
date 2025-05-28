import axios, { refreshToken } from './axiosConfig';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface Workshop {
    id: string;
    code: string;
    name: string;
    manager: string;
    conveyorBelts: ConveyorBelt[];
}

interface Teams {
    name: string;
    index: number;
}

interface Clusters {
    name: string;
    index: number;
    teams: Teams[];
}

interface ConveyorBelt {
    name: string;
    index: number;
    clusters: Clusters[];
}

interface NotificationReponse {
    id: string;
    tieuDe: string;
    noiDung: string;
    type: string;
    jobTypeId: number;
    indexTeam: number[];
    totalTeam: Teams[];
    nameJobType: string;
    custer: Clusters,
    conveyorBelt: ConveyorBelt,
}
interface NotificationRequest {
    tieuDe: string;
    noiDung: string;
    type: string;
    jobTypeId: number;
    indexTeam: number[];
    totalTeam: Teams[];
    nameJobType: string;
    custer: Clusters,
    conveyorBelt: ConveyorBelt,
}
export const workshopService = {
    // Lấy thông tin workshop theo code
    getWorkshopByCode: async (code: string): Promise<Workshop> => {
        try {
            const token = localStorage.getItem('token');
            console.log('Token:', token); // Log token để kiểm tra

            const response = await axios.get<Workshop>(`/workshops/code/${code}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Response status:', response.status);
            console.log('Response data:', response.data);

            // if (response.status === 401) {
            //     console.log('Token expired, refreshing...');
            //     await refreshToken();
            //     // Thử lại request sau khi refresh token
            //     const newToken = localStorage.getItem('token');
            //     const retryResponse = await axios.get<Workshop>(`/workshops/code/${code}`, {
            //         headers: {
            //             'Authorization': `Bearer ${newToken}`
            //         }
            //     });
            //     return retryResponse.data;
            // }

            return response.data;
        } catch (error: any) {
            console.log('error', error);
            if (error?.response?.status === 401) {
                // await refreshToken();
                console.log('error', error);
            }
            console.error('Error in getWorkshopByCode:', {
                status: error?.response?.status,
                message: error?.response?.data?.message || error.message,
                error: error
            });
            throw error;
        }
    },

    // Gửi thông báo yêu cầu hỗ trợ
    sendNotification: async (notificationData: NotificationRequest): Promise<void> => {
        try {
            const token = localStorage.getItem('token');
            console.log('Token for notification:', token);

            const response = await axios.post('/thongbao', notificationData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Notification response:', response.data);
        } catch (error: any) {
            if (error?.response?.status === 401) {
                // await refreshToken();
                // // Thử lại request sau khi refresh token
                // const newToken = localStorage.getItem('token');
                // await axios.post('/thongbao', notificationData, {
                //     headers: {
                //         'Authorization': `Bearer ${newToken}`
                //     }
                // });
                // return;
            }
            console.error('Error in getNotifications:', {
                status: error?.response?.status,
                message: error?.response?.data?.message || error.message,
                error: error
            });
            throw error;
        }
    },
    // Tắt thông báo yêu cầu hỡ trợ
    turnOffNotification: async (id: string, indexTeam: number[]) => {
        try {
            const token = localStorage.getItem('token');
            console.log('Token for notification:', token);

            const response = await axios.post('/thongbao/doc', {
                id: id,
                indexTeam: indexTeam
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Notification response:', response.data);
        } catch (error: any) {
            if (error?.response?.status === 401) {
                // await refreshToken();
                console.log('error', error);
                // Thử lại request sau khi refresh token
                // const newToken = localStorage.getItem('token');
                // await axios.post('/thongbao/doc', {
                //     jobTypeId: jobTypeId,
                //     indexTeam: indexTeam
                // }, {
                //     headers: {
                //         'Authorization': `Bearer ${newToken}`
                //     }
                // });
                // return;
            }
            console.error('Error in getNotifications:', {
                status: error?.response?.status,
                message: error?.response?.data?.message || error.message,
                error: error
            });
            throw error;
        }
    },

    // Lấy danh sách thông báo
    getNotifications: async (): Promise<NotificationReponse[]> => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            const response = await axios.get<NotificationReponse[]>('/thongbao', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });



            return response.data;
        } catch (error: any) {
            if (error?.response?.status === 401) {
                // await refreshToken();
                // // Thử lại request sau khi refresh token
                // const newToken = localStorage.getItem('token');
                // const retryResponse = await axios.get<NotificationRequest[]>('/thongbao', {
                //     headers: {
                //         'Authorization': `Bearer ${newToken}`
                //     }
                // });
                // return retryResponse.data;
            }
            console.error('Error in getNotifications:', {
                status: error?.response?.status,
                message: error?.response?.data?.message || error.message,
                error: error
            });
            throw error;
        }
    }

}; 