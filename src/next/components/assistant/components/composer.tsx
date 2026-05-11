import { Box, IconButton, InputBase, Stack } from '@mui/material';
import { Dispatch, ReactNode, SetStateAction, useRef, useState } from 'react';
import AssistantFiles from './files';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import StopCircleRoundedIcon from '@mui/icons-material/StopCircleRounded';
import ArrowCircleUpRoundedIcon from '@mui/icons-material/ArrowCircleUpRounded';

type Props = {
    loading: boolean;
    onStop: VoidFunction;
    onCompose: (prompt: string) => void;
    setFiles: Dispatch<SetStateAction<File[]>>;
    files: File[];
    children: ReactNode
};
export default function AssistantComposer({ children, loading, onCompose, onStop, setFiles, files }: Props) {
    const [prompt, setPrompt] = useState('');
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const handleFiles = (fileList: FileList | null) => {
        if (!fileList) return;
        const accepted = Array.from(fileList);
        if (accepted.length === 0) return;
        setFiles((prev) => [...prev, ...accepted]);
    };
    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onCompose(prompt);
            setPrompt('');
        }
    };
    return (
        <Box
            sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                pb: 1
            }}
        >
            <Stack direction="row" gap={2} sx={{ p: 2 }} justifyContent="end">
                <AssistantFiles files={files} setFiles={setFiles} />
            </Stack>
            <Box
                sx={{
                    bgcolor: 'background.paper',
                    p: 2,
                    borderRadius: 1
                }}
            >
                <InputBase
                    placeholder="ask something awesome..."
                    fullWidth
                    multiline
                    minRows={2}
                    maxRows={6}
                    sx={{ mx: 1 }}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={onKeyDown}
                />
                <Stack direction="row" gap={1} sx={{ mt: 1 }}>
                    <Box
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            handleFiles(e.dataTransfer.files);
                        }}
                    >
                        <IconButton size="small" onClick={() => fileInputRef.current?.click()}>
                            <AddRoundedIcon />
                        </IconButton>
                        <input ref={fileInputRef} type="file" hidden multiple onChange={(e) => handleFiles(e.target.files)} />
                    </Box>
                    {children}

                    <Box flex="1 1 auto" />
                    {loading ? (
                        <IconButton size="small" onClick={onStop}>
                            <StopCircleRoundedIcon />
                        </IconButton>
                    ) : (
                        <IconButton
                            size="small"
                            onClick={() => {
                                onCompose(prompt);
                                setPrompt('');
                            }}
                        >
                            <ArrowCircleUpRoundedIcon />
                        </IconButton>
                    )}
                </Stack>
            </Box>
        </Box>
    );
}
