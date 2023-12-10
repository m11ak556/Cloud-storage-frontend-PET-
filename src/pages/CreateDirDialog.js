import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Stack } from '@mui/material';

export default function CreateDirDialog(props) {

    const {open, onOk, onClose} = props;

    const [name, setName] = React.useState("");

    const onOkBtnClick = (e) => {
        onOk(name);
    }

    const onCloseBtnClick = (e) => {
        onClose();
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Создать папку</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Название:
                </DialogContentText>
                <Stack direction={"row"}>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        fullWidth
                        variant="standard"
                        onChange={e => setName(e.target.value)}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCloseBtnClick}>Отмена</Button>
                <Button onClick={onOkBtnClick}>Ок</Button>
            </DialogActions>
        </Dialog>
    );
}