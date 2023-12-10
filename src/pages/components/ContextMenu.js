import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

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
            <MenuItem onClick={onCreateFolderItemClick}>Создать папку</MenuItem>
            <MenuItem disabled={createDirOnly} onClick={onDownloadItemClick}>Скачать</MenuItem>
            <MenuItem disabled={createDirOnly} onClick={onMoveItemClick}>Переместить</MenuItem>
            <MenuItem disabled={createDirOnly} onClick={onDelteItemClick}>Удалить</MenuItem>
        </Menu>
    );
}