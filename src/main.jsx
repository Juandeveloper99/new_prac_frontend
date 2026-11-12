import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { DatesProvider } from '@mantine/dates';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import './index.css';
import App from './App.jsx';
import '@mantine/charts/styles.css';

const theme = createTheme({
  primaryColor: 'coral',
  primaryShade: 6,
  fontFamily: 'system-ui, -apple-system, sans-serif',
  headings: { fontFamily: 'system-ui, -apple-system, sans-serif' },
  defaultRadius: 'md',
  colors: {
    coral: [
      '#fde8e6', // 0
      '#fad1cc', // 1
      '#f7b8b0', // 2
      '#f5a199', // 3
      '#f58e85', // 4
      '#f57c73', // 5 ← primary
      '#e86359', // 6
      '#d9544b', // 7
      '#c44039', // 8
      '#a52d27', // 9
    ],
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications position="top-right" />
      <ModalsProvider>
        <DatesProvider settings={{ locale: 'es', firstDayOfWeek: 1 }}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </DatesProvider>
      </ModalsProvider>
    </MantineProvider>
  </React.StrictMode>
);
