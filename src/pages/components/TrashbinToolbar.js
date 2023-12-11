import { Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { LocalFireDepartment, Refresh } from '@mui/icons-material';

export default function TrashbinToolbar(props) {

    const {onRestoreClick, onDestroyClick, style} = props;

    const OutlinedButton = styled(Button)
    ({
        color: "#555555",
        borderWidth: "2px",
        borderColor: "#dedede"
    });


    const onRestoreButtonClick = (e) => {
        onRestoreClick();
    }

    const onDestroyButtonClick = (e) => {
        onDestroyClick();
    }

    return (
        <Stack direction={"row"} spacing={1} style={style}>
            <OutlinedButton 
                startIcon={<Refresh/>}
                variant="outlined"
                onClick={onRestoreButtonClick}>Восстановить</OutlinedButton>
            <OutlinedButton 
                startIcon={<LocalFireDepartment/>}
                variant="outlined"
                onClick={onDestroyButtonClick}>Уничтожить</OutlinedButton>
        </Stack>
    );
}
