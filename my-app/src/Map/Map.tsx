'use client';

import React, { useEffect, useState } from 'react';
import { Checkbox, Col, Form, GetProp, Row, Select, Spin, message, Input, Button } from 'antd';
import { workshopService } from '../services/workshopService';
import './style.scss';

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

interface NotificationRequest {
  tieuDe: string;
  noiDung: string;
  type: string;
  jobTypeId: number;
  nameJobType: string;
  indexTeam: number[];
  totalTeam: Teams[];
  custer: Clusters;
  conveyorBelt: ConveyorBelt;
}

interface JobType {
  id: number;
  title: string;
  color: string;
  teams?: Teams[];
  indexTeam?: number[];
}
interface SelectedJobType {
  id: number;
  teams?: Teams[];
}
interface SelectedTeam {
  teamId: number;
  jobTypeId: number;
  jobTypeTitle: string;
}

const Map = () => {
  const [loading, setLoading] = useState(true);
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [selectedConveyorBelt, setSelectedConveyorBelt] = useState<ConveyorBelt | null>(null);
  const [selectedClusters, setSelectedClusters] = useState<Clusters | null>(null);
  const [teams, setTeams] = useState<Teams[]>([]);
  const [clusters, setClusters] = useState<Clusters[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<Teams[]>([]);
  const [selectedJobTypeEnum, setSelectedJobTypeEnum] = useState<JobType[]>([]);
  const [selectedJobType, setSelectedJobType] = useState<SelectedJobType[]>([]);
  const [formRef] = Form.useForm();
  const [textToSpeak, setTextToSpeak] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const jobTypeEnum: JobType[] = [{
    id: 1,
    title: "Cơ điện",
    color: "red",
    indexTeam: []
  },
  {
    id: 2,
    title: " Tổ cắt",
    color: "green",
    indexTeam: []
  },
  {
    id: 3,
    title: "Tổ trưởng",
    color: "blue",
    indexTeam: []

  },
  {
    id: 4,
    title: "Kỹ thuật",
    color: "#B8860B",
    indexTeam: []

  }];

  const handleJobTypeClick = async (jobType: JobType) => {
    if (!selectedConveyorBelt || !selectedClusters) {
      message.warning('Vui lòng chọn Chuyền và Cụm trước');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Vui lòng đăng nhập lại');
        return;
      }

      let idteam = selectedTeams.map(t => t.index);
      console.log("selectteam");
      console.log(jobType.indexTeam);
      console.log("selectedConveyorBelt");
      console.log(selectedConveyorBelt);
      console.log("selectedClusters");
      console.log(selectedClusters);
      console.log("jobType");
      console.log(selectedJobTypeEnum);

      let notificationData: NotificationRequest = {
        tieuDe: "Thông báo yêu cầu hỗ trợ",
        noiDung: `${selectedConveyorBelt.name} ${selectedClusters.name} ${selectedTeams
          .map(t => `Tổ ${t.index}`)
          .join(', ')} ${jobType.title}`,
        type: "Yêu cầu hỗ trợ",
        jobTypeId: jobType.id,
        nameJobType: jobType.title,
        indexTeam: jobType.indexTeam || [],
        totalTeam: teams,
        conveyorBelt: selectedConveyorBelt,
        custer: selectedClusters
      };
      console.log("notificationData");
      console.log(notificationData);
      await workshopService.sendNotification(notificationData);

      message.success({
        content: 'Đã gửi thông báo thành công',
        duration: 3,
        style: {
          marginTop: '20vh',
        },
      });
    } catch (error: any) {
      if (error?.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
      } else if (error?.response?.status === 403) {
        message.error('Bạn không có quyền gửi thông báo');
      } else {
        message.error('Không thể gửi thông báo');
      }
    }
  };

  const handleConveyorBeltChange = (value: string) => {
    const selectedBelt = workshop?.conveyorBelts.find(belt => belt.name === value);
    setSelectedConveyorBelt(selectedBelt || null);
    setClusters(selectedBelt?.clusters || []);
    setSelectedClusters(null);
    setSelectedTeams([]);
    setTeams([]);
  };

  const handleTeamChange = (value: string) => {
    const selectedCluster = clusters.find(cluster => cluster.name === value);
    setSelectedClusters(selectedCluster || null);
    const clusterTeams = selectedCluster?.teams || [];
    setTeams(clusterTeams);
    setSelectedTeams([]);

    // Cập nhật jobTypeEnum với teams
    const updatedJobTypeEnum = jobTypeEnum.map(job => ({
      ...job,
      teams: clusterTeams
    }));
    setSelectedJobTypeEnum(updatedJobTypeEnum);
  };

  useEffect(() => {
    // Lấy danh sách giọng đọc có sẵn
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Tìm giọng tiếng Việt
      const vietnameseVoice = availableVoices.find(
        voice => voice.lang === 'vi-VN' || voice.name.includes('Vietnamese')
      );

      if (vietnameseVoice) {
        setSelectedVoice(vietnameseVoice);
      } else {
        message.warning('Không tìm thấy giọng đọc tiếng Việt. Vui lòng cài đặt gói ngôn ngữ tiếng Việt cho hệ thống.');
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speakText = () => {
    if (!textToSpeak) {
      message.warning('Vui lòng nhập văn bản cần chuyển thành giọng nói');
      return;
    }

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);

      // Cấu hình giọng đọc
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        message.error('Không tìm thấy giọng đọc tiếng Việt. Vui lòng cài đặt gói ngôn ngữ tiếng Việt cho hệ thống.');
        return;
      }

      utterance.rate = 0.9; // Giảm tốc độ đọc một chút
      utterance.pitch = 1.0; // Cao độ bình thường
      utterance.volume = 1.0; // Âm lượng tối đa

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        setIsSpeaking(false);
        console.error('Lỗi phát âm:', event);
        message.error('Có lỗi xảy ra khi chuyển văn bản thành giọng nói');
      };

      window.speechSynthesis.speak(utterance);
    } else {
      message.error('Trình duyệt của bạn không hỗ trợ chuyển văn bản thành giọng nói');
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    const fetchWorkshop = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          message.error('Vui lòng đăng nhập lại');
          return;
        }

        const workshopData = await workshopService.getWorkshopByCode('PX1');
        setWorkshop(workshopData);
        setLoading(false);
      } catch (error: any) {
        if (error?.response?.status === 401) {
          message.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
        } else if (error?.response?.status === 403) {
          message.error('Bạn không có quyền truy cập vào tài nguyên này');
        }
        else if (error?.response?.status === 405) {
          message.error('aaa');
        } else {
          message.error('Không thể tải thông tin phân xưởng');
        }
        setLoading(false);
      }
    };

    fetchWorkshop();
    console.log(selectedJobTypeEnum);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className='container'>
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col span={24}>
          <div style={{
            padding: '20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginBottom: '16px' }}>Chuyển văn bản thành giọng nói</h3>
            <Input.TextArea
              value={textToSpeak}
              onChange={(e) => setTextToSpeak(e.target.value)}
              placeholder="Nhập văn bản cần chuyển thành giọng nói..."
              rows={4}
              style={{ marginBottom: '16px' }}
            />
            <div style={{ marginBottom: '16px' }}>
              <Select
                style={{ width: '100%' }}
                placeholder="Chọn giọng đọc"
                value={selectedVoice?.name}
                onChange={(value) => {
                  const voice = voices.find(v => v.name === value);
                  setSelectedVoice(voice || null);
                }}
                options={voices
                  .filter(voice => voice.lang.includes('vi') || voice.name.includes('Vietnamese'))
                  .map(voice => ({
                    label: `${voice.name} (${voice.lang})`,
                    value: voice.name
                  }))}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                type="primary"
                onClick={speakText}
                disabled={isSpeaking || !selectedVoice}
              >
                Phát âm
              </Button>
              <Button
                danger
                onClick={stopSpeaking}
                disabled={!isSpeaking}
              >
                Dừng
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <div className='wrapper-job'>
        {selectedJobTypeEnum.length > 0 ? selectedJobTypeEnum.map((item) =>
          <div
            className='wrapper-job-element'
            key={item?.id}
            style={{ cursor: 'pointer' }}
          >
            <div
              style={{
                backgroundColor: `${item?.color}`,
                cursor: item.indexTeam && item.indexTeam.length > 0 ? 'pointer' : 'not-allowed',
                opacity: item.indexTeam && item.indexTeam.length > 0 ? 1 : 0.5
              }}
              className='wrapper-job-element-top'
              onClick={() => {
                if (item.indexTeam && item.indexTeam.length > 0) {
                  handleJobTypeClick(item);
                }
              }}
            >
              <p>{item?.title}</p>
            </div>
            <div className='wrapper-job-element-bottom'>
              <Checkbox.Group
                options={item.teams?.map((team) => ({
                  label: `Tổ ${team.index}`,
                  value: team.index.toString()
                }))}
                onChange={(checkedValues) => {
                  // Lọc ra các team đã chọn cho các job type khác
                  const otherJobTypeTeams = selectedTeams.filter(team =>
                    !item.teams?.some(t => t.index === team.index)
                  );

                  // Thêm các team mới được chọn cho job type hiện tại
                  const newTeams = checkedValues.map(value => {
                    const team = item.teams?.find(t => t.index.toString() === value);
                    return team!;
                  });

                  // Kết hợp cả hai mảng
                  setSelectedTeams([...otherJobTypeTeams, ...newTeams]);
                  setSelectedJobTypeEnum(prev =>
                    prev.map(jt =>
                      jt.id === item.id
                        ? { ...jt, indexTeam: checkedValues.map(Number) }
                        : jt
                    )
                  );
                }}
              />
            </div>
          </div>
        ) : jobTypeEnum.map((item) =>
          <div
            className='wrapper-job-element'
            key={item?.id}
            style={{ cursor: 'pointer' }}
          >
            <div
              style={{
                backgroundColor: `${item?.color}`,
                cursor: item.indexTeam && item.indexTeam.length > 0 ? 'pointer' : 'not-allowed',
                opacity: item.indexTeam && item.indexTeam.length > 0 ? 1 : 0.5
              }}
              className='wrapper-job-element-top'
              onClick={() => {
                if (item.indexTeam && item.indexTeam.length > 0) {
                  handleJobTypeClick(item);
                }
              }}
            >
              <p>{item?.title}</p>
            </div>
            <div className='wrapper-job-element-bottom'>
              <Checkbox.Group
                options={item.teams?.map((team) => ({
                  label: `Tổ ${team.index}`,
                  value: team.index.toString()
                }))}
                onChange={(checkedValues) => {
                  // Lọc ra các team đã chọn cho các job type khác
                  const otherJobTypeTeams = selectedTeams.filter(team =>
                    !item.teams?.some(t => t.index === team.index)
                  );

                  // Thêm các team mới được chọn cho job type hiện tại
                  const newTeams = checkedValues.map(value => {
                    const team = item.teams?.find(t => t.index.toString() === value);
                    return team!;
                  });

                  // Kết hợp cả hai mảng
                  setSelectedTeams([...otherJobTypeTeams, ...newTeams]);
                  setSelectedJobTypeEnum(prev =>
                    prev.map(jt =>
                      jt.id === item.id
                        ? { ...jt, indexTeam: checkedValues.map(Number) }
                        : jt
                    )
                  );
                }}
              />
            </div>
          </div>
        )}
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8} md={8} lg={6} xl={6}>
          <div className="job-dropdow">
            <p>Chuyền:</p>
            <Select
              style={{ height: '50px' }}
              optionFilterProp="name"
              size="large"
              placeholder="Chọn chuyền khác "
              options={workshop?.conveyorBelts?.map((item) => ({
                key: item.name,
                value: item.name,
                label: item.name,
              }))}
              onChange={handleConveyorBeltChange}
              value={selectedConveyorBelt?.name}
            />
          </div>
        </Col>
        <Col xs={24} sm={8} md={8} lg={6} xl={6}>
          <div className="job-dropdow">
            <p>Cụm:</p>
            <Select
              style={{ height: '50px' }}
              optionFilterProp="name"
              size="large"
              placeholder="Chọn cụm khác "
              options={clusters.map((team) => ({
                key: team.name,
                value: team.name,
                label: team.name,
              }))}
              onChange={handleTeamChange}
              value={selectedClusters?.name}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Map;
