import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import Loading from "./components/atoms/feedback/Loading/Loading.tsx";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import "@mantine/core/styles.layer.css";
import "@mantine/notifications/styles.layer.css";
import "@mantine/charts/styles.layer.css";
import "@mantine/dropzone/styles.css";

import "./styles/main.css";

import theme from "./config/theme.config.ts";
import "./config/translation.config.ts";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <MantineProvider
            theme={theme}
            defaultColorScheme="dark"
        >
            <Notifications />
            <React.Suspense fallback={<Loading />}>
                <App />
            </React.Suspense>
        </MantineProvider>
        ,
    </React.StrictMode>,
);
