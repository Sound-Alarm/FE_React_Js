import axios, { refreshToken } from './axiosConfig';

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
interface notificationPayload {
    content: string;
    typeNotification: {
        id: string;
        code: string;
        name: string;
    };
    timeAt: number;
    listOfReleaseDates: string[];
}

interface NotificationReponse {
    id: string;
    title: string;
    content: string;
    type: string;
    jobTypeId: number;
    indexTeam: number[];
    totalTeam: Teams[];
    nameJobType: string;
    custer: Clusters,
    conveyorBelt: ConveyorBelt,
}
interface NoteNotificationReponse {
    id: string;
    code: string;
    name: string;
}
interface NotificationRequest {
    title: string;
    content: string;
    type: string;
    jobTypeId: number;
    indexTeam: number[];
    totalTeam: Teams[];
    nameJobType: string;
    custer: Clusters,
    conveyorBelt: ConveyorBelt,
}
interface NotificationReadResponse {
    id: string;
    code: string;
    content: string;
    title: string;
    oneRead: boolean;
    readAt: string;
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
            console.log('Notification status:', response.status);

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
    },

    // Lấy danh sách thông báo
    getNoteNotifications: async (): Promise<NoteNotificationReponse[]> => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            const response = await axios.get<NoteNotificationReponse[]>('/thongbao/type_notification', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });



            return response.data;
        } catch (error: any) {
            if (error?.response?.status === 401) {

            }
            console.error('Error in getNotifications:', {
                status: error?.response?.status,
                message: error?.response?.data?.message || error.message,
                error: error
            });
            throw error;
        }
    },

    postNotification: async (values: notificationPayload): Promise<void> => {
        try {
            let token = localStorage.getItem("token");
            console.log("Token for notification:", token);

            const response = await axios.post("/thongbao/create_emergency_notice", values, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("Notification response:", response.data);
        } catch (error: any) {
            if (error?.response?.status === 401) {
                try {
                    console.warn("Token expired, refreshing...");

                    await refreshToken(); // Giả định hàm này sẽ cập nhật token mới vào localStorage
                    const newToken = localStorage.getItem("token");

                    const retryResponse = await axios.post("/thongbao/create_emergency_notice", values, {
                        headers: {
                            Authorization: `Bearer ${newToken}`,
                        },
                    });

                    console.log("Retry notification response:", retryResponse.data);
                } catch (retryError: any) {
                    console.error("Retry after refresh failed:", {
                        status: retryError?.response?.status,
                        message: retryError?.response?.data?.message || retryError.message,
                    });
                    throw retryError;
                }
            } else {
                console.error("Error in postNotification:", {
                    status: error?.response?.status,
                    message: error?.response?.data?.message || error.message,
                    error: error,
                });
                throw error;
            }
        }
    },
    // Tạo danh sách đọc
    getNotificationReading: async (): Promise<NotificationReadResponse[]> => {
        try {
            const token = localStorage.getItem('token');
            console.log('Token:', token); // Log token để kiểm tra

            const response = await axios.get<NotificationReadResponse[]>(`/thongbao/get_all_notification_read`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Response status:', response.status);
            console.log('Response data:', response.data);

            return response.data;
        } catch (error: any) {
            console.error('Error in getNotificationReading:', {
                status: error?.response?.status,
                message: error?.response?.data?.message || error.message,
                error: error
            });
            throw error;
        }
    }
}; 