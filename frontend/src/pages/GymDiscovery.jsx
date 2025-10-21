import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Input, Select, Tag, Space } from 'antd';
import { SearchOutlined, EnvironmentOutlined, ClockCircleOutlined, PhoneOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const { Search } = Input;
const { Option } = Select;

const GymDiscovery = () => {
  const navigate = useNavigate();
  const [gyms, setGyms] = useState([]);
  const [filteredGyms, setFilteredGyms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchGyms();
  }, []);

  useEffect(() => {
    filterAndSortGyms();
  }, [gyms, searchTerm, sortBy]);

  const fetchGyms = async () => {
    try {
      const response = await api.get('/user/gyms');
      setGyms(response.data);
    } catch (error) {
      console.error('Failed to fetch gyms:', error);
    }
  };

  const filterAndSortGyms = () => {
    let filtered = gyms.filter(gym => 
      gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gym.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'location':
          return a.address.localeCompare(b.address);
        default:
          return 0;
      }
    });

    setFilteredGyms(filtered);
  };



  return (
    <div>
      {/* Search and Filter Section */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Search
              placeholder="Search gyms by name or location..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="large"
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="Sort by"
              value={sortBy}
              onChange={setSortBy}
              style={{ width: '100%' }}
              size="large"
            >
              <Option value="name">Name</Option>
              <Option value="location">Location</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Tag color="blue">{filteredGyms.length} gyms found</Tag>
          </Col>
        </Row>
      </Card>

      {/* Gyms Grid */}
      <Row gutter={[16, 16]}>
        {filteredGyms.map(gym => (
          <Col xs={24} sm={12} lg={8} key={gym._id}>
            <Card
              hoverable
              cover={
                gym.logo ? (
                  <img alt={gym.name} src={gym.logo} style={{ height: 200, objectFit: 'cover' }} />
                ) : (
                  <div style={{ 
                    height: 200, 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}>
                    {gym.name.charAt(0)}
                  </div>
                )
              }
              actions={[
                <Button 
                  type="primary" 
                  icon={<EyeOutlined />}
                  onClick={() => navigate(`/gym/${gym.slug}`)}
                >
                  View Details
                </Button>
              ]}
            >
              <Card.Meta
                title={gym.name}
                description={
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div>
                      <EnvironmentOutlined /> {gym.address}
                    </div>
                    {gym.operatingHours && (
                      <div>
                        <ClockCircleOutlined /> {gym.operatingHours.open} - {gym.operatingHours.close}
                      </div>
                    )}
                    {gym.phone && (
                      <div>
                        <PhoneOutlined /> {gym.phone}
                      </div>
                    )}
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>


    </div>
  );
};

export default GymDiscovery;