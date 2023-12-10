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
        const result = await axios.get(loginEndpoint
            + "login=" + login
            + "&password=" + password);

        const router = createBrowserRouter([
        {
            path: "/",
            element: <Home userId = {result.data}/>
        }]);
        
        ReactDOM.createRoot(document.getElementById("root")).render(
        <React.StrictMode>
            <RouterProvider router={router} />
        </React.StrictMode>
        );
    }

    const onBtnLoginClick = (e) => {
        loginUser();
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
                    <Link href="/register">Зарегистрироваться</Link>
                </Stack>
            </Box>
        </Stack>
    );
};