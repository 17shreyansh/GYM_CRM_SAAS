import React, { useState } from 'react';
import { Card, Table, Tag, Button, Modal, Form, TimePicker, Select, Space, message } from 'antd';
import { CalendarOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;

const StaffSchedule = ({ staff, onUpdateSchedule }) => {
  const [scheduleModal, setScheduleModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [form] = Form.useForm();

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  const handleEditSchedule = (staffMember) => {
    setEditingStaff(staffMember);
    form.setFieldsValue({
      schedule: staffMember.schedule || []
    });
    setScheduleModal(true);
  };

  const handleSubmitSchedule = async (values) => {
    try {
      await onUpdateSchedule(editingStaff._id, values.schedule);
      setScheduleModal(false);
      message.success('Schedule updated successfully');
    } catch (error) {
      message.error('Failed to update schedule');
    }
  };

  const columns = [
    {
      title: 'Staff Member',
      key: 'staff',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.user_id.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.title}</div>
        </div>
      )
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color="blue">{role.replace('_', ' ').toUpperCase()}</Tag>
      )
    },
    ...days.map(day => ({
      title: day.charAt(0).toUpperCase() + day.slice(1),
      key: day,
      width: 120,
      render: (_, record) => {
        const daySchedule = record.schedule?.find(s => s.day === day);
        if (!daySchedule) return <Tag color="default">Off</Tag>;
        
        return (
          <div style={{ fontSize: '11px' }}>
            <div>{daySchedule.start_time} - {daySchedule.end_time}</div>
            {daySchedule.break_start && (
              <div style={{ color: '#666' }}>
                Break: {daySchedule.break_start} - {daySchedule.break_end}
              </div>
            )}
          </div>
        );
      }
    })),
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => handleEditSchedule(record)}
        >
          Edit
        </Button>
      )
    }
  ];

  return (
    <>
      <Card
        title={
          <Space>
            <CalendarOutlined />
            Staff Schedule
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Bulk Schedule
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={staff.filter(s => s.status === 'active')}
          rowKey="_id"
          pagination={false}
          scroll={{ x: 1200 }}
          size="small"
        />
      </Card>

      <Modal
        title="Edit Schedule"
        open={scheduleModal}
        onCancel={() => setScheduleModal(false)}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={handleSubmitSchedule} layout="vertical">
          <Form.List name="schedule">
            {(fields, { add, remove }) => (
              <>
                {days.map(day => {
                  const existingField = fields.find(field => 
                    form.getFieldValue(['schedule', field.name, 'day']) === day
                  );
                  
                  return (
                    <Card key={day} size="small" style={{ marginBottom: 8 }}>
                      <div style={{ fontWeight: 500, marginBottom: 8 }}>
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </div>
                      
                      {existingField ? (
                        <Space>
                          <Form.Item
                            name={[existingField.name, 'start_time']}
                            style={{ marginBottom: 0 }}
                          >
                            <TimePicker format="HH:mm" placeholder="Start" />
                          </Form.Item>
                          <Form.Item
                            name={[existingField.name, 'end_time']}
                            style={{ marginBottom: 0 }}
                          >
                            <TimePicker format="HH:mm" placeholder="End" />
                          </Form.Item>
                          <Button 
                            type="text" 
                            danger 
                            onClick={() => remove(existingField.name)}
                          >
                            Remove
                          </Button>
                        </Space>
                      ) : (
                        <Button
                          type="dashed"
                          onClick={() => add({ day, start_time: '09:00', end_time: '17:00' })}
                        >
                          Add Schedule
                        </Button>
                      )}
                    </Card>
                  );
                })}
              </>
            )}
          </Form.List>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setScheduleModal(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Update Schedule
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default StaffSchedule;