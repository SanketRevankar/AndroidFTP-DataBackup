import './App.css';
import { useState } from 'react';
import Main from './Main';
import { BrowserRouter as Router } from "react-router-dom";
import { useMediaQuery, createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { lightBlue } from '@mui/material/colors';

export default function App() {
    const preferedMode = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true }) ? 'dark' : 'light'
    const savedMode = localStorage.getItem("mode")
    const mode = savedMode ? savedMode : preferedMode
    const [themeType, setTheme] = useState(mode)
    const darkMode = themeType === 'dark'

    const switchTheme = () => {
        const newMode = darkMode ? "light" : "dark"
        setTheme(newMode);
        localStorage.setItem("mode", newMode);
    }

    const theme = createTheme({
        palette: darkMode ? {
            mode: 'dark',
            primary: {
                main: 'rgb(144, 183, 249)'
            },
            secondary: lightBlue,
            error: {
                main: 'rgb(255, 99, 132)'
            },
            success: {
                main: 'rgb(75, 192, 192)'
            },
            background: {
                default: '#252525',
                paper: '#282828'
            }
        } : {
            mode: 'light',
            primary: {
                main: 'rgb(48, 102, 201)'
            },
            success: {
                main: '#00ae07'
            },
            background: {
                default: '#fff',
                paper: '#f8f8f8'
            }
        },
        components: {
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: darkMode ? '#011432' : '#1b3052'
                    }
                }
            }
        }
    })

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router basename='/AndroidFTPBackup'>
                <Main switchTheme={switchTheme} themeType={themeType} />
            </Router>
        </ThemeProvider>
    )
}
