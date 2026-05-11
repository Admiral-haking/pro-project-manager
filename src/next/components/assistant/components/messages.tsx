import { ShinyText } from '@next/components/react-bits/shiny';
import { Avatar, Box, Card, CardContent, Link, Stack, Typography } from '@mui/material';
import { AxiosError } from 'axios';
import type { WithTime, ChatCompletionMessage, ChatRole } from 'easy-llm-call';
import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import ArrowRightRoundedIcon from '@mui/icons-material/ArrowRightRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';

type Props = {
    messages: WithTime<ChatCompletionMessage>[];
    errors: {
        errors: WithTime<Error>[];
        axiosErrors: WithTime<AxiosError<unknown, any>>[];
        toolErrors: WithTime<
            Error & {
                id: string;
                name: string;
            }
        >[];
    };
    loading: boolean;
    files: File[];
};



export default function AssistantMessages({ errors, messages, loading, files }: Props) {

    const errorMessages: WithTime<ChatCompletionMessage>[] = [
        ...errors.errors.map((error) => ({
            timestamp: error.timestamp,
            role: 'error' as ChatRole,
            content: error.message,
        })),
        ...errors.axiosErrors.map((axiosError) => ({
            timestamp: axiosError.timestamp,
            role: 'error' as ChatRole,
            content: axiosError.message,
        })),
        ...errors.toolErrors.map((toolError) => ({
            timestamp: toolError.timestamp,
            role: 'error' as ChatRole,
            content: `(${toolError.name}): ${toolError.message}`,
            tool_call_id: toolError.id,
            name: toolError.name,
        })),
    ];

    const mixedArray = [...messages.filter((x) => x.role !== 'system' && x.role !== 'tool'), ...errorMessages].sort(
        (a, b) => a.timestamp - b.timestamp
    );

    return (
        <Stack
            gap={4}
            sx={{
                '& *': {
                    fontSize: 12,
                },
                '& img, image': {
                    width: '100%',
                },
                '& code,pre': {
                    width: '100%',
                },
                p: 2,
            }}
        >
            {mixedArray.map((message, i) =>
                message.role !== 'user' ? (
                    <Stack direction="row" alignItems="center" gap={2} key={message.timestamp?.toString().concat(i + '') || i}>
                        {(message.role as any) === 'error' ? <ArrowRightRoundedIcon /> : null}
                        <Box>
                            <Markdown
                                components={{
                                    a: Link,
                                    p: Typography,
                                }}
                                urlTransform={(url) => {
                                    if (url.startsWith('blob')) return url;

                                    if (!url.startsWith('/') || url.startsWith('attachment:')) {
                                        const file = files.find((x) => x.name === url.replace('attachment:', ''));
                                        if (!file) return url;
                                        return URL.createObjectURL(file);
                                    }
                                    return url;
                                }}
                            >
                                {message.content}
                            </Markdown>
                        </Box>
                    </Stack>
                ) : (
                    <Stack
                        direction="row-reverse"
                        alignItems="center"
                        justifyContent="end"
                        gap={2}
                        key={message.timestamp?.toString().concat(i + '') || i}
                    >
                        <Avatar
                            sx={{
                                bgcolor: 'primary.main',
                                height: 32,
                                width: 32,
                            }}
                        >
                            <PersonRoundedIcon />
                        </Avatar>
                        <Card>
                            <CardContent>
                                <Markdown
                                    components={{
                                        a: Link,
                                        p: Typography,
                                        img: ({ node, ...props }) => <BlobImage {...(props as any)} />,
                                    }}
                                >
                                    {message.content}
                                </Markdown>
                            </CardContent>
                        </Card>
                    </Stack>
                )
            )}
            {loading && <ShinyText text="thinking..." speed={1} />}
        </Stack>
    );
}
const BlobImage = ({ src, alt, ...props }: { src: string; alt: string }) => {
    const [objectUrl, setObjectUrl] = useState('');

    console.log(props, src);

    useEffect(() => {
        if (src.startsWith('blob:')) {
            setObjectUrl(src);
        } else {
            setObjectUrl(src);
        }
    }, [src]);

    return <img src={objectUrl} alt={alt} />;
};
