import React, { useState } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Routes from './Routes';
import { PaletteType } from '@material-ui/core';
import { lightBlue, deepPurple, indigo } from '@material-ui/core/colors';
import { BrowserRouter as Router } from "react-router-dom";

function App() {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true });
    const savedTheme = localStorage.getItem("dark-mode")
    const mode: boolean = savedTheme ? savedTheme == 'true' : prefersDarkMode

    let sTheme: PaletteType = mode ? 'dark' : 'light'
    const [themeType, setTheme] = useState(sTheme);
    const switchTheme = () => {
        localStorage.setItem("dark-mode", JSON.stringify(themeType === "light"));
        setTheme(themeType === "light" ? "dark" : "light");
    };

    const theme = createTheme({
        palette: {
            type: themeType,
            primary: indigo,
            secondary: themeType === "light" ? deepPurple : lightBlue,
        },
    })

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router basename='/AndroidFTPBackup'>
                <Routes data={{ switchTheme: switchTheme, themeType: themeType }} />
            </Router>
        </ThemeProvider>
    );
}

export default App;