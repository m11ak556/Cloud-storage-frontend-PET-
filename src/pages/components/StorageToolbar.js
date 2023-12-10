import { Stack } from '@mui/material';

export default function StorageToolbar(props) {

    const {onUploadClick, onDownloadClick,
           onMoveFileClick, onDeleteFileClick,
           style} = props;

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
            <button className="btn btn-primary" onClick={onUploadButtonClick}>Загрузить файл</button>
            <button className="btn btn-primary" onClick={onDownloadButtonClick}>Скачать файл</button>
            <button className="btn btn-primary" onClick={onMoveFileButtonClick}>Переместить</button>
            <button className="btn btn-danger" onClick={onDeleteFileButtonClick}>Удалить</button>
        </Stack>
    );
}
