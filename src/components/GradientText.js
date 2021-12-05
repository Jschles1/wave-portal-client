import React from 'react';
import { Text } from '@chakra-ui/react';

const GradientText = (props) => (
    <Text
        fontWeight="bold"
        bgGradient="linear(43deg, rgb(217, 76, 214) 12.66%, rgb(81, 182, 249) 121.19%, rgba(217, 76, 214, 0) 121.2%)"
        bgClip="text"
        {...props}
    >
        {props.children}
    </Text>
);

export default GradientText;
