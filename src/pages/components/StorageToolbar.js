import { Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { Block, CloudUpload, Download, DriveFileMove, RemoveCircle } from '@mui/icons-material/';

export default function StorageToolbar(props) {

    const {onUploadClick, onDownloadClick,
           onMoveFileClick, onDeleteFileClick,
           style} = props;

    const OutlinedButton = styled(Button)
        ({
            color: "#555555",
            borderWidth: "2px",
            borderColor: "#dedede"
        });

    const onUploadButtonClick = (e) => {
        onUploadClick();
    }

    const onDownloadButtonClick = (e) => {
        onDownloadClick();
    }

    const onMoveFileButtonClick = (e) => {
        onMoveFileClick();
    }

    const onDeleteFileButtonClick = (e) => {
        onDeleteFileClick();
    }

    return (
        <Stack direction={"row"} spacing={1} style={style}>
            <OutlinedButton 
                startIcon={<CloudUpload/>}
                variant="outlined"
                onClick={onUploadButtonClick}>Загрузить файл</OutlinedButton>
            <OutlinedButton 
                startIcon={<Download/>}
                variant="outlined"
                onClick={onDownloadButtonClick}>Скачать файл</OutlinedButton>
            <OutlinedButton 
                variant="outlined"
                startIcon={<DriveFileMove/>}
                onClick={onMoveFileButtonClick}>Переместить</OutlinedButton>
            <OutlinedButton 
                variant="outlined"
                startIcon={<RemoveCircle/>}
                onClick={onDeleteFileButtonClick}>Удалить</OutlinedButton>
        </Stack>
    );
}
