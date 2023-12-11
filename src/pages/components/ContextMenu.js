import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { ListItemIcon, ListItemText } from '@mui/material';
import { CreateNewFolder, Download, DriveFileMove, RemoveCircle } from '@mui/icons-material';

export default function ContextMenu(props) {

    const {contextMenu, onClose, onDownloadClick,
           onMoveClick, onDeleteClick, onCreateFolderClick,
           createDirOnly } = props;

    const closeMenu = () => {
        onClose();
    };

    const onCreateFolderItemClick = (e) => {
        onCreateFolderClick();
        closeMenu();
    }

    const onDownloadItemClick = (e) => {
        onDownloadClick();
        closeMenu();
    }

    const onMoveItemClick = (e) => {
        onMoveClick();
        closeMenu();
    }

    const onDelteItemClick = (e) => {
        onDeleteClick();
        closeMenu();
    }

    return (
        <Menu
            open={contextMenu !== null}
            onClose={closeMenu}
            anchorReference="anchorPosition"
            anchorPosition={
                contextMenu !== null
                    ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                    : undefined
            }
        >
            <MenuItem onClick={onCreateFolderItemClick}>
                <ListItemIcon><CreateNewFolder/></ListItemIcon>
                <ListItemText>Создать папку</ListItemText>
            </MenuItem>
            <MenuItem disabled={createDirOnly} onClick={onDownloadItemClick}>
                <ListItemIcon><Download/></ListItemIcon>
                <ListItemText>Скачать</ListItemText>
            </MenuItem>
            <MenuItem disabled={createDirOnly} onClick={onMoveItemClick}>
                <ListItemIcon><DriveFileMove/></ListItemIcon>
                <ListItemText>Переместить</ListItemText>
            </MenuItem>
            <MenuItem disabled={createDirOnly} onClick={onDelteItemClick}>
                <ListItemIcon><RemoveCircle/></ListItemIcon>
                <ListItemText>Удалить</ListItemText>
            </MenuItem>
        </Menu>
    );
}