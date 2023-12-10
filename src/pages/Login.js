import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Box, InputLabel, Link, Stack } from '@mui/material';
import axios from 'axios';

export default function Login() {

    const [login, setLogin] = React.useState("");
    const [password, setPassword] = React.useState("");

    const loginEndpoint = "http://localhost:8080/auth/login?"

    const logigUser = () => {
        axios.get(loginEndpoint
            + "login=" + login
            + "&password=" + password)
    }

    const onBtnLoginClick = (e) => {
        logigUser();
    }

    return (
        <Stack>
            <Stack direction={"row"}>
                <Box width={120}><InputLabel>Логин:</InputLabel></Box>
                <Box><TextField onChange={e => setLogin(e.target.value)} /></Box>
            </Stack>
            <Stack direction={"row"}>
                <Box width={120}><InputLabel>Пароль:</InputLabel></Box>
                <Box><TextField onChange={e => setPassword(e.target.value)} type='password' /></Box>
            </Stack>
            <Box alignSelf={"center"}>
                <Stack>
                    <Button onClick={onBtnLoginClick}>Войти</Button>
                    <Link>Зарегистрироваться</Link>
                </Stack>
            </Box>
        </Stack>
    );
};