import React, { useState, useEffect } from 'react';
import { Layout as AntLayout, Menu, Button, Avatar, Dropdown, Badge } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  DashboardOutlined,
  SettingOutlined,
  TeamOutlined,
  CalendarOutlined,
  QrcodeOutlined,
  FileTextOutlined,
  CustomerServiceOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';

const { Header, Sider, Content } = AntLayout;

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [gym, setGym] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);

  useEffect(() => {
    if (user?.role === 'gym_owner') {
      fetchGymDetails();
    }
    
    const handleResize = () => {
      const mobile = window.innerWidth <= 992;
      setIsMobile(mobile);
      if (!mobile) {
        setCollapsed(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [user]);

  const fetchGymDetails = async () => {
    try {
      const response = await api.get('/gym/details');
      setGym(response.data.gym);
    } catch (error) {
      console.error('Failed to fetch gym details:', error);
    }
  };

  const getMenuItems = () => {
    if (user?.role === 'admin') {
      return [
        { key: '/admin', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/admin/gyms', icon: <TeamOutlined />, label: 'Gyms' },
        { key: '/admin/users', icon: <UserOutlined />, label: 'Users' },
        { key: '/support', icon: <CustomerServiceOutlined />, label: 'Support' },
      ];
    }
    if (user?.role === 'gym_owner') {
      return [
        { key: '/gym', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/gym/setup', icon: <SettingOutlined />, label: 'Gym Setup' },
        { key: '/gym/plans', icon: <FileTextOutlined />, label: 'Plans' },
        { key: '/gym/members', icon: <TeamOutlined />, label: 'Members' },
        { key: '/gym/attendance', icon: <CalendarOutlined />, label: 'Attendance' },
        { key: '/gym/qr', icon: <QrcodeOutlined />, label: 'QR Code' },
        { key: '/support', icon: <CustomerServiceOutlined />, label: 'Support' },
      ];
    }
    return [
      { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
      { key: '/profile', icon: <UserOutlined />, label: 'Profile' },
      { key: '/attendance', icon: <CalendarOutlined />, label: 'My Attendance' },
      { key: '/support', icon: <CustomerServiceOutlined />, label: 'Support' },
    ];
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => navigate('/profile')}>
        Profile
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Settings
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={logout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  const siderStyle = {
    background: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)',
    borderRight: '1px solid #e2e8f0'
  };

  const headerStyle = {
    background: '#ffffff',
    padding: '0 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #f1f5f9',
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    height: '64px',
    position: 'sticky',
    top: 0,
    zIndex: 100
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      {/* Mobile Overlay */}
      {isMobile && !collapsed && (
        <div 
          className="mobile-sidebar-overlay visible"
          onClick={() => setCollapsed(true)}
        />
      )}
      
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        style={siderStyle}
        width={280}
        collapsedWidth={0}
        trigger={null}
        breakpoint="lg"
        onBreakpoint={(broken) => {
          setCollapsed(broken);
          setIsMobile(broken);
        }}
        zeroWidthTriggerStyle={{
          top: '16px',
          right: '-36px',
          background: 'var(--primary-color)',
          borderRadius: '0 6px 6px 0'
        }}
      >
        {/* Logo/Brand Section */}
        <div style={{ 
          padding: collapsed ? '16px 8px' : '20px 24px', 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {user?.role === 'gym_owner' && gym?.gym_logo ? (
            <img 
              src={gym.gym_logo} 
              alt="Gym Logo" 
              style={{ 
                width: collapsed ? '32px' : '40px', 
                height: collapsed ? '32px' : '40px', 
                borderRadius: '8px',
                objectFit: 'cover'
              }} 
            />
          ) : (
            <div style={{
              width: collapsed ? '32px' : '40px',
              height: collapsed ? '32px' : '40px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: collapsed ? '14px' : '16px'
            }}>
              {user?.role === 'gym_owner' ? 'G' : user?.role === 'admin' ? 'A' : 'M'}
            </div>
          )}
          {!collapsed && (
            <div>
              <div style={{ 
                color: 'white', 
                fontWeight: '600', 
                fontSize: '16px',
                lineHeight: '1.2'
              }}>
                {user?.role === 'gym_owner' && gym ? 
                  (gym.gym_display_name || gym.gym_name) : 
                  'Gym SaaS'
                }
              </div>
              {user?.role === 'gym_owner' && gym && (
                <div style={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  fontSize: '12px'
                }}>
                  {gym.location?.city || 'Gym Portal'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={getMenuItems()}
          onClick={({ key }) => navigate(key)}
          style={{ 
            background: 'transparent',
            border: 'none',
            marginTop: '16px'
          }}
        />
      </Sider>
      
      <AntLayout>
        <Header style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 40,
                height: 40,
              }}
            />
            <div style={{ display: collapsed ? 'none' : 'block' }}>
              <h2 style={{ 
                margin: 0, 
                fontSize: '18px', 
                fontWeight: '600',
                color: 'var(--text-primary)',
                lineHeight: '1.2'
              }}>
                Welcome back, {user?.name?.split(' ')[0]}
              </h2>
              <p style={{ 
                margin: '2px 0 0 0', 
                fontSize: '12px', 
                color: 'var(--text-secondary)',
                lineHeight: '1.2'
              }}>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Badge count={0} size="small">
              <Button 
                type="text" 
                icon={<BellOutlined />} 
                style={{ fontSize: '16px', width: 40, height: 40 }}
              />
            </Badge>
            
            <Dropdown overlay={userMenu} placement="bottomRight" trigger={['click']}>
              <Button 
                type="text" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  height: '40px',
                  padding: '0 12px',
                  borderRadius: '8px'
                }}
              >
                <Avatar 
                  size={32}
                  icon={<UserOutlined />} 
                  style={{ 
                    background: 'var(--primary-color)'
                  }}
                />
                <span style={{ 
                  fontWeight: '500',
                  color: 'var(--text-primary)'
                }}>
                  {user?.name?.split(' ')[0]}
                </span>
              </Button>
            </Dropdown>
          </div>
        </Header>
        
        <Content style={{ overflow: 'auto', padding: 0 }}>
          <div style={{ padding: '16px', minHeight: 'calc(100vh - 64px)' }}>
            {children}
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;