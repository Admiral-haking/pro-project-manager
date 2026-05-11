import {
    Avatar,
    Badge,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Fab,
    IconButton,
    ImageList,
    ImageListItem,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Stack,
    Tooltip,
} from '@mui/material';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import NoteAddRoundedIcon from '@mui/icons-material/NoteAddRounded';
import FolderCopyRoundedIcon from '@mui/icons-material/FolderCopyRounded';
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import FileCopyRoundedIcon from '@mui/icons-material/FileCopyRounded';

type Props = {
    files: File[];
    setFiles: Dispatch<SetStateAction<File[]>>;
};
export default function AssistantFiles({ files, setFiles }: Props) {
    const [open, setOpen] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const fileUrls = useMemo(
        () =>
            files.map((file) => ({
                name: file.name,
                url: URL.createObjectURL(file),
                type: file.type,
            })),
        [files]
    );

    const closePreview = () => {
        setPreview(null);
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    if (!files.length) return null;

    return (
        <>
            <Tooltip title="Add Files">
                <Badge color="primary" badgeContent={files.length} overlap="circular">
                    <Fab
                        size="medium"
                        color="secondary"
                        onClick={() => setOpen(true)}
                        sx={{
                            boxShadow: 8,
                            background: 'linear-gradient(135deg, #4f46e5, #10b981)',
                            color: '#fff',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #4338ca, #0ea271)',
                            },
                        }}
                    >
                        <NoteAddRoundedIcon />
                    </Fab>
                </Badge>
            </Tooltip>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: 'linear-gradient(180deg, #0f172a 0%, #111827 70%, #0b1221 100%)',
                        color: '#e5e7eb',
                        boxShadow: 24,
                    },
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FolderCopyRoundedIcon />
                    Chat Files
                </DialogTitle>
                <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <Stack spacing={2}>
                        <List dense disablePadding>
                            {fileUrls.map((item, index) => {
                                const isImage = item.type.startsWith('image/');

                                const iconName = isImage ? 'solar:image-bold-duotone' : 'solar:document-bold-duotone';

                                return (
                                    <ListItem
                                        key={item.name + index}
                                        secondaryAction={
                                            <IconButton edge="end" onClick={() => removeFile(index)}>
                                                <HighlightOffRoundedIcon />
                                            </IconButton>
                                        }
                                        sx={{
                                            mb: 1,
                                            borderRadius: 2,
                                            backdropFilter: 'blur(8px)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            background: 'rgba(255,255,255,0.02)',
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar
                                                variant="rounded"
                                                src={isImage ? item.url : undefined}
                                                sx={{
                                                    bgcolor: 'rgba(255,255,255,0.08)',
                                                    color: '#c7d2fe',
                                                    width: 48,
                                                    height: 48,
                                                    border: '1px solid rgba(255,255,255,0.06)',
                                                    cursor: isImage ? 'pointer' : 'default',
                                                }}
                                                onClick={() => isImage && setPreview(item.url)}
                                            >
                                                <FileCopyRoundedIcon />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Stack direction="row" alignItems="center" spacing={1} sx={{ overflow: 'hidden' }}>
                                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {item.name}
                                                    </span>
                                                </Stack>
                                            }
                                            secondary={`${(files[index].size / 1024 / 1024).toFixed(2)} MB`}
                                        />
                                    </ListItem>
                                );
                            })}
                        </List>

                        {fileUrls.some((f) => f.type.startsWith('image/')) && (
                            <ImageList cols={3} gap={8}>
                                {fileUrls
                                    .filter((f) => f.type.startsWith('image/'))
                                    .map((item, idx) => (
                                        <ImageListItem key={item.name + idx} sx={{ cursor: 'pointer' }} onClick={() => setPreview(item.url)}>
                                            <img
                                                src={item.url}
                                                alt={item.name}
                                                loading="lazy"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    borderRadius: 8,
                                                    border: '1px solid rgba(255,255,255,0.06)',
                                                }}
                                            />
                                        </ImageListItem>
                                    ))}
                            </ImageList>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2, borderColor: 'rgba(255,255,255,0.08)' }}>
                    <Button onClick={() => setFiles([])} color="inherit" sx={{ textTransform: 'none' }}>
                        clear
                    </Button>
                    <Button variant="contained" onClick={() => setOpen(false)} sx={{ textTransform: 'none' }}>
                        close
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={!!preview}
                onClose={closePreview}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    sx: {
                        backgroundColor: 'black',
                    },
                }}
                onClick={closePreview}
            >
                <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {preview && <img src={preview} alt="preview" style={{ maxWidth: '100%', maxHeight: '80vh' }} />}
                </DialogContent>
            </Dialog>
        </>
    );
}
