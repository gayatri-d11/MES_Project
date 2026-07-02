import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';
import constants from '../../theme/constants';

const { Title, Text } = Typography;

const styles = {
  wrapper: {
    display: 'flex',
    height: '100vh',
    fontFamily: constants.fontFamily,
  },
  leftPanel: {
    flex: 1,
    backgroundColor: colors.primary,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '48px',
  },
  logoText: {
    fontSize: '42px',
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: '4px',
    marginBottom: '16px',
  },
  tagline: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: '15px',
    textAlign: 'center',
    maxWidth: '280px',
    lineHeight: '1.6',
  },
  rightPanel: {
    width: '460px',
    backgroundColor: colors.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
  },
  card: {
    width: '100%',
    border: `1px solid ${colors.border}`,
    borderRadius: constants.borderRadius,
    boxShadow: constants.cardShadow,
  },
  cardTitle: {
    marginBottom: '4px',
    color: colors.textPrimary,
    fontFamily: constants.fontFamily,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: '13px',
    marginBottom: '28px',
    display: 'block',
  },
  loginBtn: {
    width: '100%',
    height: '40px',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },
  footer: {
    marginTop: '20px',
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: '12px',
  },
};

export default function LoginPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (values) => {
    setErrorMsg('');
    try {
      await login(values.employeeId, values.password);
      const token = localStorage.getItem('access_token');
      const payload = JSON.parse(atob(token.split('.')[1]));
      const pages = payload.pages || [];
      if (pages.includes('dashboard')) {
        navigate('/');
      } else if (pages.includes('transactions')) {
        navigate('/transactions');
      } else if (pages.includes('production')) {
        navigate('/production');
      } else if (pages.includes('master_data')) {
        navigate('/master-data/screen1');
      } else if (pages.includes('settings')) {
        navigate('/settings');
      } else {
        navigate('/login');
      }
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.leftPanel}>
        <div style={styles.logoText}>BROSE</div>
        <Text style={styles.tagline}>Plant Digitalization Platform</Text>
        <Text style={{ ...styles.tagline, marginTop: '32px', fontSize: '13px' }}>
          Manage your plant operations, production data, and master configurations in one place.
        </Text>
      </div>

      <div style={styles.rightPanel}>
        <Card style={styles.card} variant="outlined">
          <Title level={4} style={styles.cardTitle}>Welcome Back</Title>
          <Text style={styles.subtitle}>Sign in with your Brose Employee credentials</Text>

          <Form form={form} layout="vertical" onFinish={handleLogin} requiredMark={false}>
            <Form.Item
              name="employeeId"
              label="Employee ID"
              rules={[{ required: true, message: 'Please enter your Employee ID' }]}
            >
              <Input
                addonBefore={<UserOutlined style={{ color: colors.border }} />}
                placeholder="00000001"
                maxLength={11}
                size="large"
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  form.setFieldValue('employeeId', `BR-${val}`);
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: colors.border }} />}
                placeholder="Enter your password"
                size="large"
              />
            </Form.Item>

            {errorMsg && (
              <Form.Item style={{ marginBottom: '12px' }}>
                <Alert message={errorMsg} type="error" showIcon />
              </Form.Item>
            )}
            <Form.Item style={{ marginBottom: '8px' }}>
              <Button type="primary" htmlType="submit" size="large" style={styles.loginBtn}>
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <div style={styles.footer}>
            © {new Date().getFullYear()} Brose Group · Internal Use Only
          </div>
        </Card>
      </div>
    </div>
  );
}
