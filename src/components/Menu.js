import React from 'react';
import { Box, Text } from '@chakra-ui/layout';

const Layout = ({ children }) => (
    <Box
        width="300px"
        minHeight="100vh"
        p={4}
        mx="auto"
        bgColor="main.100"
        borderRightWidth="1px"
        borderRightColor="moccasin.300"
    >
        <Text
            fontWeight="bold"
            fontSize="24px"
            m={0}
            bgGradient="linear(43deg, rgb(217, 76, 214) 12.66%, rgb(81, 182, 249) 121.19%, rgba(217, 76, 214, 0) 121.2%)"
            bgClip="text"
            textAlign="center"
        >
            Wave Portal
        </Text>
    </Box>
);

export default Layout;
