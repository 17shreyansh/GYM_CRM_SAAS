import React from 'react';
import { Card, Row, Col, Statistic, Progress, List, Avatar, Tag, Space } from 'antd';
import { 
  UserOutlined, TeamOutlined, ClockCircleOutlined, 
  TrophyOutlined, CalendarOutlined, DollarOutlined 
} from '@ant-design/icons';

const StaffDashboard = ({ staff }) => {
  const getStaffStats = () => {
    const total = staff.length;
    const active = staff.filter(s => s.status === 'active').length;
    const onLeave = staff.filter(s => s.status === 'on_leave').length;
    
    const roleStats = staff.reduce((acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    }, {});
    
    const recentHires = staff
      .filter(s => {
        const hireDate = new Date(s.hire_date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return hireDate >= thirtyDaysAgo;
      })
      .length;
    
    return { total, active, onLeave, roleStats, recentHires };
  };

  const stats = getStaffStats();
  
  const roleColors = {
    trainer: 'blue',
    front_desk: 'green',
    nutritionist: 'orange',
    manager: 'purple',
    cleaner: 'cyan',
    maintenance: 'red'
  };

  const recentStaff = staff
    .sort((a, b) => new Date(b.hire_date) - new Date(a.hire_date))
    .slice(0, 5);

  return (
    <div style={{ marginBottom: 24 }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Staff"
              value={stats.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Staff"
              value={stats.active}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress 
              percent={stats.total ? Math.round((stats.active / stats.total) * 100) : 0} 
              size="small" 
              showInfo={false}
              strokeColor="#52c41a"
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="On Leave"
              value={stats.onLeave}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Recent Hires"
              value={stats.recentHires}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1' }}
              suffix="(30 days)"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Staff by Role" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              {Object.entries(stats.roleStats).map(([role, count]) => (
                <div key={role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Tag color={roleColors[role]}>
                    {role.replace('_', ' ').toUpperCase()}
                  </Tag>
                  <span style={{ fontWeight: 500 }}>{count}</span>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Recent Additions" size="small">
            <List
              size="small"
              dataSource={recentStaff}
              renderItem={(member) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        src={member.user_id.photo} 
                        icon={<UserOutlined />}
                        size="small"
                      />
                    }
                    title={
                      <Space>
                        <span>{member.user_id.name}</span>
                        <Tag color={roleColors[member.role]} size="small">
                          {member.role.replace('_', ' ')}
                        </Tag>
                      </Space>
                    }
                    description={`Hired: ${new Date(member.hire_date).toLocaleDateString()}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StaffDashboard;