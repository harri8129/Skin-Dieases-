import { useState } from 'react';
import { Modal, Form, Input, Button, Space, notification } from 'antd';
import {
  UserAddOutlined, LoginOutlined, UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, CloseOutlined
} from '@ant-design/icons';
import { toast } from 'react-toastify';

export default function AuthModal({ open, mode, onClose, onSuccess, switchMode }) {
  // mode: 'login' or 'register'
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Validation rules
  const registerRules = {
    username: [
      { required: true, message: 'Please enter your username' },
      { min: 3, message: 'Username must be at least 3 characters' },
      { max: 50, message: 'Username must be less than 50 characters' },
      { pattern: /^[a-zA-Z0-9_]+$/, message: 'Only letters, numbers, and underscores allowed' }
    ],
    email: [
      { required: true, message: 'Please enter your email' },
      { type: 'email', message: 'Please enter a valid email address' },
      { max: 100, message: 'Email must be less than 100 characters' }
    ],
    password: [
      { required: true, message: 'Please enter your password' },
      { min: 6, message: 'Password must be at least 6 characters' },
      { max: 128, message: 'Password must be less than 128 characters' },
      { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Must contain uppercase, lowercase, and a number' }
    ],
    phone: [
      { required: true, message: 'Please enter your phone number' },
      { pattern: /^[\+]?[1-9][\d]{0,15}$/, message: 'Please enter a valid phone number' }
    ]
  };

  const loginRules = {
    username_or_email: [
      { required: true, message: 'Please enter your username or email' },
      { max: 100, message: 'Must be less than 100 characters' }
    ],
    password: [
      { required: true, message: 'Please enter your password' }
    ]
  };

  // Submit handler
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (mode === 'register') {
        const res = await fetch('http://localhost:8000/api/userdetails/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });
        const data = await res.json();
        if (res.ok) {
          notification.success({ message: 'Registration successful! Please login.' });
          form.resetFields();
          onSuccess && onSuccess('register', values);
          toast.success("Registeration succesfull")
        } else {
          let errorMessage = 'Registration failed.';
          if (data && typeof data === 'object') {
            errorMessage = Object.values(data).join(', ');
          }
          notification.error({ message: 'Registration Failed', description: errorMessage });
          toast.error("registeration unsuccesfull")
        }
      } else {
        // login
        const res = await fetch('http://localhost:8000/api/userdetails/login/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });
        const data = await res.json();
        if (res.ok) {
          notification.success({ message: 'Login successful!' });
          form.resetFields();
          onSuccess && onSuccess('login', data.user);
          toast.success("login succesfull")
        } else {
          let errorMessage = 'Login failed. Please check your credentials.';
          if (data && data.error) errorMessage = data.error;
          notification.error({ message: 'Login Failed', description: errorMessage });
          toast.error("login unsuccesfull")
        }
      }
    } catch (err) {
      notification.error({ message: 'Network Error', description: 'Please try again.' });
    }
    setLoading(false);
  };

  // Modal content
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={420}
      centered
      destroyOnClose
      closeIcon={<CloseOutlined style={{ fontSize: 16 }} />}
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {mode === 'register' ? <UserAddOutlined style={{ color: '#722ed1' }} /> : <LoginOutlined style={{ color: '#722ed1' }} />}
          {mode === 'register' ? 'Create Account' : 'Login to Your Account'}
        </span>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        size="large"
        validateTrigger={['onBlur', 'onChange']}
      >
        {mode === 'register' ? (
          <>
            <Form.Item name="username" label="Username" rules={registerRules.username}>
              <Input prefix={<UserOutlined />} placeholder="Enter your username" allowClear />
            </Form.Item>
            <Form.Item name="email" label="Email Address" rules={registerRules.email}>
              <Input prefix={<MailOutlined />} placeholder="Enter your email" allowClear />
            </Form.Item>
            <Form.Item name="password" label="Password" rules={registerRules.password}>
              <Input.Password prefix={<LockOutlined />} placeholder="Enter your password" allowClear />
            </Form.Item>
            <Form.Item name="phone" label="Phone Number" rules={registerRules.phone}>
              <Input prefix={<PhoneOutlined />} placeholder="Enter your phone number" allowClear />
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item name="username_or_email" label="Username or Email" rules={loginRules.username_or_email}>
              <Input prefix={<UserOutlined />} placeholder="Enter your username or email" allowClear />
            </Form.Item>
            <Form.Item name="password" label="Password" rules={loginRules.password}>
              <Input.Password prefix={<LockOutlined />} placeholder="Enter your password" allowClear />
            </Form.Item>
          </>
        )}

        <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Button onClick={onClose} size="large" style={{ borderRadius: 8, minWidth: 100 }}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              style={{
                background: 'linear-gradient(135deg, #722ed1 0%, #1890ff 100%)',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                minWidth: 120
              }}
            >
              {loading ? (mode === 'register' ? 'Creating...' : 'Logging in...') : (mode === 'register' ? 'Create Account' : 'Login')}
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* Switch link */}
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        {mode === 'register' ? (
          <span>
            Already have an account?{' '}
            <Button type="link" onClick={switchMode} style={{ padding: 0, color: '#722ed1', fontWeight: 600 }}>
              Login here
            </Button>
          </span>
        ) : (
          <span>
            Don't have an account?{' '}
            <Button type="link" onClick={switchMode} style={{ padding: 0, color: '#722ed1', fontWeight: 600 }}>
              Register here
            </Button>
          </span>
        )}
      </div>
    </Modal>
  );
}
