import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { TreeView } from '@mui/x-tree-view';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export default function SelectFolderDialog(props) {

    const {open, onOk, onClose, treeItems, mappedItems} = props;
    const [selectedPath, setSelectedPath] = React.useState("");

    const onFolderSelected = (e, id) => {
        const selectedItem = mappedItems[id];
        setSelectedPath(selectedItem.path == ""
            ? selectedItem.name
            : selectedItem.path + "/" + selectedItem.name);
        console.log(selectedPath);
    }

    const onOkBtnClick = (e) => {
        onOk(selectedPath);
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Выбрать папку</DialogTitle>
            <DialogContent>
                <TreeView
                    aria-label="file system navigator"
                    defaultCollapseIcon={<ExpandMoreIcon />}
                    defaultExpandIcon={<ChevronRightIcon />}
                    onNodeSelect={onFolderSelected}>
                    {treeItems}
                </TreeView>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button onClick={onOkBtnClick}>Ок</Button>
            </DialogActions>
        </Dialog>
    );
}