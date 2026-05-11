import { Box } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useEasyLLM } from 'easy-llm-call/react';
import AssistantComposer from './components/composer';
import AssistantTemperature from './components/temperature';
import ChatPlaceholder from './components/chat-placeholder';
import AssistantMessages from './components/messages';
import { usePathname, useRouter } from 'next/navigation';
import { ChatCompletionMessage, ChatRole, WithTime } from 'easy-llm-call';

// DeepSeek has a 128k window; keep some headroom for the reply and tool schemas (plus ~5 future tools).
const DEEPSEEK_CONTEXT_LIMIT = 128_000;
const COMPLETION_HEADROOM_TOKENS = 3_000;
const REGISTERED_TOOL_COUNT = 32;
const FUTURE_TOOL_PADDING = 5;
const AVERAGE_TOOL_TOKEN_COST = 180;
const TOOL_TOKEN_BUDGET = (REGISTERED_TOOL_COUNT + FUTURE_TOOL_PADDING) * AVERAGE_TOOL_TOKEN_COST;
const MIN_PROMPT_BUDGET = Math.max(1_000, DEEPSEEK_CONTEXT_LIMIT - COMPLETION_HEADROOM_TOKENS - TOOL_TOKEN_BUDGET);

const estimateMessageTokens = (msgs: ChatCompletionMessage[]) => {
    return msgs.reduce((total, msg) => {
        const contentLength = typeof msg.content === 'string' ? msg.content.length : 0;
        const reasoningLength = typeof msg.reasoning_content === 'string' ? msg.reasoning_content.length : 0;
        const toolCallsLength = msg.tool_calls ? JSON.stringify(msg.tool_calls).length : 0;
        const nameLength = msg.name?.length ?? 0;
        const roleLength = msg.role?.length ?? 0;
        // Rough rule of thumb: ~4 characters per token plus a tiny overhead per message.
        const tokenEstimate = Math.ceil((contentLength + reasoningLength + toolCallsLength + nameLength + roleLength) / 4);
        return total + tokenEstimate + 8;
    }, 0);
};

const enforceDeepseekContextWindow = (history: WithTime<ChatCompletionMessage>[], pending: ChatCompletionMessage) => {
    const historyClone = [...history];
    const payloadMessages = historyClone.map(({ timestamp, ...rest }) => rest);
    const messagesWithPending = [...payloadMessages, pending];
    const availableBudget = Math.max(1_000, MIN_PROMPT_BUDGET);

    let tokenUsage = estimateMessageTokens(messagesWithPending);

    // Drop the oldest non-system entry (index 1) until we fit, but never remove the initial system prompt.
    while (tokenUsage > availableBudget && messagesWithPending.length > 2) {
        messagesWithPending.splice(1, 1);
        historyClone.splice(1, 1);
        tokenUsage = estimateMessageTokens(messagesWithPending);
    }

    if (tokenUsage > availableBudget) return null;

    const pendingWithTime: WithTime<ChatCompletionMessage> = { ...pending, timestamp: Date.now() };

    return {
        uiMessages: [...historyClone, pendingWithTime],
        payloadMessages: messagesWithPending,
    };
};

export default function AiAdminAssistant() {
    const router = useRouter();

    const pathname = usePathname();

    const [temperature, setTemperature] = useState(0.5);

    const { loading, messages, llm, errors, setMessages } = useEasyLLM({
        url: '/api/llm/deepseek',
        systemPrompt: '',
    });
    const messagesRef = useRef<WithTime<ChatCompletionMessage>[]>(messages);

    const [files, setFiles] = useState<File[]>([]);
    const filesRef = useRef<File[]>([]);
    const addFile = useCallback((file: File) => {
        setFiles((prev) => {
            const next = [...prev, file];
            filesRef.current = next;
            return next;
        });
    }, []);

    const addAssistantMessage = useCallback(
        (content: string) => {
            setMessages((prev) => [...prev, { role: 'assistant', content, timestamp: Date.now() }]);
        },
        [setMessages]
    );

    const viewportRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    // Auto-scroll on message add
    useEffect(() => {
        if (messages.length < 5) return;
        viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, loading]);

    const onSend = useCallback(
        (rawContent: string, role: ChatRole = 'user') => {
            const content = rawContent.trim();
            if (!content) return;

            const trimmedContext = enforceDeepseekContextWindow(messagesRef.current, { role, content });

            if (!trimmedContext) {
                addAssistantMessage('Message is too long for the DeepSeek context window. Please shorten it.');
                return;
            }

            setMessages(trimmedContext.uiMessages);
            llm.send({
                temperature,
                messages: trimmedContext.payloadMessages,
                model: 'deepseek-chat',
            });
        },
        [addAssistantMessage, llm, setMessages, temperature]
    );



    useEffect(() => {
        if (!files.length) return;
        setMessages((l) => [
            ...l,
            { role: 'system', content: `user last provided files:\n${files.map((x) => x.name).join('\n')}`, timestamp: Date.now() },
        ]);
    }, [files.map((x) => x.name).join(', ')]);

    useEffect(() => {
        setMessages((l) => [...l, { role: 'system', content: `user has navigated to: ${pathname}`, timestamp: Date.now() }]);
    }, [pathname]);

    filesRef.current = files;
    return (
        <Box
            sx={{
                maxHeight: '100%',
                height: '100%',
                overflowY: 'hidden',
                position: 'relative',
            }}
        >
            <Box
                sx={{
                    minWidth: 256,
                    maxHeight: '100%',
                    height: '100%',
                    overflowY: 'scroll',
                    position: 'relative',
                }}
                ref={viewportRef}
            >
                {messages.filter((x) => x.role !== 'system').length === 0 && <ChatPlaceholder />}

                <Box sx={{ height: 100 }} />
                <AssistantMessages errors={errors} messages={messages} loading={loading} files={files} />

                <Box sx={{ height: 200 }} />
            </Box>

            <AssistantComposer loading={loading} onStop={llm.abort} onCompose={onSend} setFiles={setFiles} files={files}>
                <AssistantTemperature value={temperature} onChange={setTemperature} />
            </AssistantComposer>
        </Box>
    );
}
