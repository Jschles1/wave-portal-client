import React from 'react';
import { Box } from '@chakra-ui/react';

const Card = ({ children }) => (
    <Box borderColor="main.200" borderWidth="1px" p="8px" borderRadius="lg" my="16px">
        {children}
    </Box>
);

export default Card;
