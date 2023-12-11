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
    const emailRegex =
        /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    const registerUser = async () => {
        const data = {
            login: login,
            email: email,
            password: password
        }

        try {
            await axios.post(createUserEndpoint, data)
                .then(() => window.location.href = "/");
        } catch {
            alert("Не удалось завершить регистрацию");
        }
    }

    const loginValid = () => {
        if (login == "") {
            alert("Пожалуйста, заполните логин");
            return false
        }

        return true;
    }

    const emailValid = () => {
        if (email == "") {
            alert("Пожалуйста, укажите почту");
            return false;
        }

        if (!email.match(emailRegex)) {
            alert("Указана некорректная почта");
            return false;
        }

        return true;
    }

    const passwordValid = () => {
        if (password == "") {
            alert("Пароль не может быть пустым");
            return false;
        }
        if (repeatPassword == "") {
            alert("Пожалуйста, повторите пароль");
            return false;
        }
        if (password != repeatPassword) {
            alert("Пароль должны совпадать")
            return false;
        }

        return true;
    }

    const onBtnCancelClick = (e) => {
        onCancel();
    }

    const onBtnSendClick = (e) => {
        if (!loginValid()) return;
        if (!passwordValid()) return;
        if (!emailValid()) return;

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