import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Box, InputLabel, Stack } from '@mui/material';
import axios from 'axios';

export default function Registration(props) {
    const {onCancel} = props;

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

        await axios.post(createUserEndpoint, data);
    }

    const onBtnCancelClick = (e) => {
        onCancel();
    }

    const onBtnSendClick = (e) => {
        registerUser();
    }

    return (
        <Stack>
            <Stack direction={"row"}>
                <Box>
                    <Stack spacing={4}>
                        <InputLabel>Логин:</InputLabel>
                        <InputLabel>Почта:</InputLabel>
                        <InputLabel>Пароль:</InputLabel>
                        <InputLabel>Повторить пароль:</InputLabel>
                    </Stack>
                </Box>
                <Box>
                    <Stack>
                        <TextField onChange={e => setLogin(e.target.value)} />
                        <TextField onChange={e => setEmail(e.target.value)} type='email' />
                        <TextField onChange={e => setPassword(e.target.value)} type='password' />
                        <TextField onChange={e => setRepeatPassword(e.target.value)} type='password' />
                    </Stack>
                </Box>
            </Stack>
            <Box>
                <Button onClick={onBtnSendClick}>Отправить</Button>
                <Button href="/" onClick={onBtnCancelClick}>Отмена</Button>
            </Box>
        </Stack>
    );
};