import * as React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Delete from '@mui/icons-material/Delete';
import { Warehouse } from '@mui/icons-material';

const StyledButton = styled(Button)
    ({
        color: "#555555",
        background: "#dedede",
        width: "100%"
    });

export default function StorageButton(props) {
    const {onClick} = props;

    const onBtnClick = (e) => {
        onClick();
    }

    return <StyledButton startIcon={<Warehouse/>} onClick={onBtnClick}>Хранилище</StyledButton>   
}