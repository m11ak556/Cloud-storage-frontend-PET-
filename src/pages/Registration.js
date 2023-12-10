import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Box, InputLabel, Stack } from '@mui/material';
import axios from 'axios';

export default function Registration(props) {
    const { onCancel } = props;

    const [login, setLogin] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [repeatPassword, setRepeatPassword] = React.useState("");

    const createUserEndpoint = "http://localhost:8080/user/create"

    const registerUser = async () => {
        const data = {
            login: login,
            email: email,
            password: password
        }

        await axios.post(createUserEndpoint, data)
            .then(() => window.location.href = "/");
    }

    const onBtnCancelClick = (e) => {
        onCancel();
    }

    const onBtnSendClick = (e) => {
        registerUser();
    }

    return (
        <Stack style={{marginTop: "16%"}}>
            <Box alignSelf={"center"}>
                <Stack spacing={1}>
                    <Stack direction={"row"}>
                        <InputLabel style={{ width: "160px" }}>Логин:</InputLabel>
                        <TextField size="small" onChange={e => setLogin(e.target.value)} />
                    </Stack>
                    <Stack direction={"row"}>
                        <InputLabel style={{ width: "160px" }}>Почта:</InputLabel>
                        <TextField size="small" onChange={e => setEmail(e.target.value)} type='email' />
                    </Stack>
                    <Stack direction={"row"}>
                        <InputLabel style={{ width: "160px" }}>Пароль:</InputLabel>
                        <TextField size="small" onChange={e => setPassword(e.target.value)} type='password' />
                    </Stack>
                    <Stack direction={"row"}>
                        <InputLabel style={{ width: "160px" }}>Повторить пароль:</InputLabel>
                        <TextField size="small" onChange={e => setRepeatPassword(e.target.value)} type='password' />
                    </Stack>
                </Stack>
            </Box>
            <Box alignSelf={"center"} marginTop={"25px"}>
                <Button 
                    variant="contained" 
                    onClick={onBtnSendClick}>Отправить</Button>
                <Button 
                    href="/" 
                    style={{marginLeft: "25px"}}
                    onClick={onBtnCancelClick}>Отмена</Button>
            </Box>
        </Stack>
    );
};