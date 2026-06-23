import { Flex, Paper, ScrollArea } from "@mantine/core";
import { useEffect, useRef, useState } from "react";

export default function ConsoleDisplay() {
    const viewport = useRef<HTMLDivElement>(null);
    const [logs, setLogs] = useState<string[]>([]);

    const addNewLog = (log: string) => setLogs((oldLogs) => [log, ...oldLogs]);
    const scrollToBottom = () => viewport.current && viewport.current?.scrollTo({ top: viewport.current?.scrollHeight, behavior: "smooth" });

    useEffect(() => {
        scrollToBottom();

        // dummy logs:
        const interval = setInterval(() => addNewLog(`${new Date(Date.now()).toUTCString()}: Test log of the Console Display`), 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Paper
            bg="dark"
            p="xs"
            h="100%"
        >
            <ScrollArea
                viewportRef={viewport}
                h="100%"
                ff="Office Code Pro D"
                fz="sm"
            >
                <Flex
                    direction="column-reverse"
                    mih="100vh"
                >
                    {logs.map((e, i) => (
                        <div key={i}>{e}</div>
                    ))}
                </Flex>
            </ScrollArea>
        </Paper>
    );
}
