import React from 'react';
import { Typography } from 'antd';
import colors from '../../theme/colors';

const { Title, Text } = Typography;

export default function DashboardPage() {
  return (
    <div>
      <Title level={4} style={{ color: colors.textPrimary, marginBottom: '4px' }}>
        Dashboard
      </Title>
      <Text style={{ color: colors.textSecondary }}>
        Welcome to the Brose Plant Digitalization Platform.
      </Text>
    </div>
  );
}
