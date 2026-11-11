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

const theme = createTheme({
  primaryColor: 'pink',
  fontFamily: 'system-ui, -apple-system, sans-serif',
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
