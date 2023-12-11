import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Box, InputLabel, Link, Stack } from '@mui/material';
import axios from 'axios';
import Home from './Home';
import * as ReactDOM from 'react-dom';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

export default function Login() {

    const [login, setLogin] = React.useState("");
    const [password, setPassword] = React.useState("");

    const loginEndpoint = "http://localhost:8080/auth/login?"

    const loginUser = async () => {
        let result;
        try {
            result = await axios.get(loginEndpoint
                + "login=" + login
                + "&password=" + password);
        } catch {
            alert("Не удалось выполнить вход");
            return;
        }

        // Создание новой страницы для перехода.
        // Ей мы передаем id пользователя, чтобы она смогла
        // загрузить его файлы
        const router = createBrowserRouter([
        {
            path: "/",
            element: <Home userId = {result.data}/>
        }]);
        
        // Переход на созданную страницу
        ReactDOM.createRoot(document.getElementById("root")).render(
        <React.StrictMode>
            <RouterProvider router={router} />
        </React.StrictMode>
        );
    }

    const loginValid = () => {
        if (login == "") {
            alert("Пожалуйста, введите логин");
            return false;
        }

        return true;
    }

    const passwordValid = () => {
        if (password == "") {
            alert("Пожалуйста, введите пароль");
            return false;
        }

        return true;
    }

    const onBtnLoginClick = (e) => {
        if (!loginValid()) return;
        if (!passwordValid()) return;

        loginUser();
    }

    return (
            <Stack style={{marginTop: "21%"}}>
                <Box alignSelf={"center"}>
                    <Stack direction={"row"} style={{marginBottom: "12px"}}>
                        <Box width={100}><InputLabel>Логин:</InputLabel></Box>
                        <Box><TextField size="small" onChange={e => setLogin(e.target.value)} /></Box>
                    </Stack>
                    <Stack direction={"row"}>
                        <Box width={100}><InputLabel>Пароль:</InputLabel></Box>
                        <Box><TextField size="small" onChange={e => setPassword(e.target.value)} type='password' /></Box>
                    </Stack>
                </Box>
                <Box alignSelf={"center"} marginTop={"18px"}>
                    <Stack>
                        <Button 
                            style={{marginBottom: "12px"}}
                            variant="contained" 
                            onClick={onBtnLoginClick}>Войти</Button>
                        <Link href="/register">Зарегистрироваться</Link>
                    </Stack>
                </Box>
            </Stack>
    );
};