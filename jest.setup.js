import '@testing-library/jest-dom';

// Mock Telegram WebApp
global.WebApp = {
  ready: jest.fn(),
  expand: jest.fn(),
  close: jest.fn(),
  sendData: jest.fn(),
  showAlert: jest.fn(),
  showConfirm: jest.fn(),
  showPopup: jest.fn(),
  onEvent: jest.fn(),
  offEvent: jest.fn(),
  initData: '',
  initDataUnsafe: {
    user: {
      id: 123456789,
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser',
      language_code: 'ru',
    },
  },
  version: '6.0',
  platform: 'web',
  colorScheme: 'light',
  themeParams: {
    bg_color: '#ffffff',
    text_color: '#000000',
    hint_color: '#999999',
    link_color: '#2481cc',
    button_color: '#2481cc',
    button_text_color: '#ffffff',
    secondary_bg_color: '#f1f1f1',
  },
  isExpanded: true,
  viewportHeight: 600,
  viewportStableHeight: 600,
  headerColor: '#2481cc',
  backgroundColor: '#ffffff',
  isClosingConfirmationEnabled: false,
  isVerticalSwipesEnabled: true,
};

// Mock environment variables
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.TIMEWEB_API_KEY = 'test-api-key';
process.env.TIMEWEB_API_URL = 'https://api.timeweb.cloud';
