import React from 'react';
import { Modal, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import NoteNofication from '../NoteNofication';

interface NoteNoficationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const NoteNoficationModal: React.FC<NoteNoficationModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Tạo thông báo</span>
                    <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={onClose}
                        style={{ marginRight: -12 }}
                    />
                </div>
            }
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={900}
            destroyOnClose
            closeIcon={null}
            maskClosable={false}
            centered={false}
            style={{ top: 50 }}
            bodyStyle={{
                maxHeight: 'calc(100vh - 250px)',
                overflowY: 'auto',
                padding: '24px'
            }}
        >
            <NoteNofication />
        </Modal>
    );
};

export default NoteNoficationModal; 