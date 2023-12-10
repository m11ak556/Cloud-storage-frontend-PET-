import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Stack } from '@mui/material';
import SelectFolderDialog from './SelectFolderDialog';

export default function MoveToDirDialog(props) {

    const {open, onOk, onClose, treeItems, mappedItems} = props;

    const [selectFolderDialogOpen, setSelectFolderDialogOpen] = React.useState(false);
    const [path, setPath] = React.useState("");

    const onPathSelected = (selectedPath) => {
        setPath(selectedPath);
        setSelectFolderDialogOpen(false);
    }

    const onOkBtnClick = (e) => {
        onOk(path);
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Переместить файл</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Новое расположение:
                </DialogContentText>
                <Stack direction={"row"}>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        fullWidth
                        value={path}
                        variant="standard"
                    />
                    <Button onClick={() => setSelectFolderDialogOpen(true)}>Обзор...</Button>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button onClick={onOkBtnClick}>Ок</Button>
            </DialogActions>
            <SelectFolderDialog 
                open={selectFolderDialogOpen} 
                onOk={onPathSelected}
                onClose={() => setSelectFolderDialogOpen(false)}
                treeItems={treeItems}
                mappedItems={mappedItems}/>
        </Dialog>
    );
}