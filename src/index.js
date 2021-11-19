import React from 'react';
import ReactDOM from 'react-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import theme from '@chakra-ui/theme';
import App from './App';

const customTheme = extendTheme({
    ...theme,
    styles: {
        ...theme.styles,
        global: (props) => ({
            ...theme.styles.global,
            body: {
                ...theme.styles.global.body,
                fontFamily: 'BlinkMacSystemFont',
                bg: '#0d1116',
                color: 'white',
                overflowX: 'hidden',
            },
        }),
    },
    colors: {
        main: {
            100: '#0d1116',
            200: '#121f2f',
            300: '#394a60',
        },
    },
});

ReactDOM.render(
    <ChakraProvider theme={customTheme}>
        <App />
    </ChakraProvider>,
    document.getElementById('root')
);
