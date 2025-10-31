import React, { useState } from 'react';
import { Layout, Menu, Drawer, Button, Avatar, Dropdown, Badge } from 'antd';
import { 
  MenuOutlined, 
  DashboardOutlined, 
  UserOutlined, 
  LogoutOutlined,
  BellOutlined,
  SettingOutlined,
  HomeOutlined,
  SearchOutlined,
  CreditCardOutlined,
  CalendarOutlined,
  TeamOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Content } = Layout;

const MobileLayout = ({ children }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getMenuItems = () => {
    if (user?.role === 'member') {
      return [
        { key: '/dashboard', icon: <HomeOutlined />, label: 'Dashboard' },
        { key: '/gyms', icon: <SearchOutlined />, label: 'Find Gyms' },
        { key: '/memberships', icon: <FileTextOutlined />, label: 'My Memberships' },
        { key: '/payments', icon: <CreditCardOutlined />, label: 'Payment History' },
        { key: '/attendance', icon: <CalendarOutlined />, label: 'Attendance' },
        { key: '/notifications', icon: <BellOutlined />, label: 'Notifications' },
        { key: '/profile', icon: <SettingOutlined />, label: 'Profile' },
      ];
    }
    
    if (user?.role === 'gym_owner') {
      return [
        { key: '/gym', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/gym/members', icon: <TeamOutlined />, label: 'Members' },
        { key: '/gym/plans', icon: <FileTextOutlined />, label: 'Plans' },
        { key: '/gym/attendance', icon: <CalendarOutlined />, label: 'Attendance' },
        { key: '/gym/staff', icon: <UserOutlined />, label: 'Staff' },
        { key: '/gym/notifications', icon: <BellOutlined />, label: 'Notifications' },
        { key: '/profile', icon: <SettingOutlined />, label: 'Settings' },
      ];
    }

    return [];
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile')
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      {/* Modern Mobile Header */}
      <Header style={{ 
        background: 'var(--bg-primary)', 
        padding: '0 20px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-light)',
        height: '64px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerVisible(true)}
            style={{ 
              marginRight: 16,
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
          <div style={{ 
            fontSize: '20px', 
            fontWeight: '700',
            color: 'var(--primary-color)',
            fontFamily: 'var(--font-family)'
          }}>
            💪 ORDIIN
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Badge count={0} size="small">
            <Button
              type="text"
              icon={<BellOutlined />}
              onClick={() => navigate('/notifications')}
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            />
          </Badge>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Avatar 
              style={{ 
                backgroundColor: 'var(--primary-color)', 
                cursor: 'pointer',
                width: 40,
                height: 40
              }}
              icon={<UserOutlined />}
            />
          </Dropdown>
        </div>
      </Header>

      {/* Modern Navigation Drawer */}
      <Drawer
        title={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 0'
          }}>
            <Avatar 
              style={{ backgroundColor: 'var(--primary-color)' }}
              icon={<UserOutlined />}
            />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {user?.role === 'member' ? 'Member' : 'Gym Owner'}
              </div>
            </div>
          </div>
        }
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        bodyStyle={{ padding: '16px 0' }}
        headerStyle={{ 
          borderBottom: '1px solid var(--border-light)',
          background: 'var(--bg-primary)'
        }}
        width={280}
      >
        <Menu
          mode="vertical"
          selectedKeys={[location.pathname]}
          items={getMenuItems()}
          onClick={({ key }) => {
            navigate(key);
            setDrawerVisible(false);
          }}
          style={{ 
            border: 'none',
            background: 'transparent'
          }}
        />
        
        <div style={{ 
          position: 'absolute',
          bottom: '20px',
          left: '16px',
          right: '16px'
        }}>
          <Button 
            type="primary" 
            danger 
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{
              width: '100%',
              height: '44px',
              borderRadius: 'var(--radius-md)'
            }}
          >
            Logout
          </Button>
        </div>
      </Drawer>

      {/* Content with safe area */}
      <Content className="mobile-safe-area" style={{ 
        padding: '16px',
        background: 'var(--bg-secondary)',
        minHeight: 'calc(100vh - 64px)',
        overflow: 'auto'
      }}>
        {children}
      </Content>
    </Layout>
  );
};

export default MobileLayout;