import React, { useEffect, useState } from 'react';
import axios from '../services/axiosConfig';
import { Card, Typography, List, Spin, Alert } from 'antd';
const { Title, Text } = Typography;

interface Position {
    name: string;
    index: number;
}

interface Team {
    name: string;
    index: number;
    positions: Position[];
}

interface ConveyorBelt {
    name: string;
    index: number;
    teams: Team[];
}

interface Workshop {
    id: string;
    code: string;
    name: string;
    manager: string;
    conveyorBelts: ConveyorBelt[];
}

const WorkshopDetail: React.FC = () => {
    const [workshop, setWorkshop] = useState<Workshop | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWorkshop = async () => {
            try {
                const response = await axios.get<Workshop>('http://localhost:8080/api/workshops/code/22201');
                console.log(response);
                setWorkshop(response.data);
                setLoading(false);
            } catch (err) {
                setError('Không thể tải thông tin phân xưởng');
                setLoading(false);
            }
        };

        fetchWorkshop();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return <Alert type="error" message={error} />;
    }

    if (!workshop) {
        return <Alert type="warning" message="Không tìm thấy thông tin phân xưởng" />;
    }

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <Title level={2}>{workshop.name}</Title>
                <Text strong>Mã phân xưởng: </Text>
                <Text>{workshop.code}</Text>
                <br />
                <Text strong>Quản lý: </Text>
                <Text>{workshop.manager}</Text>

                <Title level={3} style={{ marginTop: '24px' }}>Danh sách băng truyền</Title>
                <List
                    dataSource={workshop.conveyorBelts}
                    renderItem={(conveyorBelt) => (
                        <List.Item>
                            <Card title={`Băng truyền ${conveyorBelt.index}: ${conveyorBelt.name}`} style={{ width: '100%' }}>
                                <List
                                    dataSource={conveyorBelt.teams}
                                    renderItem={(team) => (
                                        <List.Item>
                                            <Card title={`Tổ ${team.index}: ${team.name}`} style={{ width: '100%' }}>
                                                <List
                                                    dataSource={team.positions}
                                                    renderItem={(position) => (
                                                        <List.Item>
                                                            <Text>Vị trí {position.index}: {position.name}</Text>
                                                        </List.Item>
                                                    )}
                                                />
                                            </Card>
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    );
};

export default WorkshopDetail;