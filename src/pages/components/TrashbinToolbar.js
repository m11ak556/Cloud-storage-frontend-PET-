import { Stack } from '@mui/material';

export default function TrashbinToolbar(props) {

    const {onRestoreClick, onDestroyClick, style} = props;

    const onRestoreButtonClick = (e) => {
        onRestoreClick();
    }

    const onDestroyButtonClick = (e) => {
        onDestroyClick();
    }

    return (
        <Stack direction={"row"} spacing={1} style={style}>
            <button className="btn btn-primary" onClick={onRestoreButtonClick}>Восстановить</button>
            <button className="btn btn-danger" onClick={onDestroyButtonClick}>Уничтожить</button>
        </Stack>
    );
}
