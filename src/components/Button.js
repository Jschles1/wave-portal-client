import React from 'react';
import { Button, keyframes } from '@chakra-ui/react';

const CustomButton = ({ disabled, onClick, children }) => {
    const gradient = 'linear(43deg, rgb(217, 76, 214) 12.66%, rgb(81, 182, 249) 121.19%, rgba(217, 76, 214, 0) 121.2%)';

    const gradientAnimation = keyframes`
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    `;

    const animation = `${gradientAnimation} 4s ease infinite`;

    return (
        <Button
            disabled={disabled}
            display="block"
            variant="outline"
            onClick={onClick}
            bgGradient={gradient}
            bgSize="200% 200%"
            animation={animation}
            border={0}
            h="45px"
            mx="auto"
            my="16px"
            width="auto"
            px="40px"
            borderRadius="20px"
            cursor="pointer"
            fontSize="16px"
            fontWeight="bold"
            color="white"
            _hover={{
                bgGradient: gradient,
                bgSize: '200% 200%',
                animation: animation,
            }}
        >
            {children}
        </Button>
    );
};

export default CustomButton;
