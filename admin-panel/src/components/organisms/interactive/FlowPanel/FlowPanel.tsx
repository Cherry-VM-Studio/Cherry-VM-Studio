import { Button } from "@mantine/core";
import { Panel } from "@xyflow/react";
import RefreshFlowMachinesButton from "../../../molecules/interactive/RefreshFlowMachinesButton/RefreshFlowMachinesButton";
import ApplyRestoreButtonPair from "../ApplyRestoreButtonPair/ApplyRestoreButtonPair";
import NetworkWorkspaceSelect from "../../../molecules/interactive/NetworkWorkspaceSelect/NetworkWorkspaceSelect";
import classes from "./FlowPanel.module.css";
import cs from "classnames";

export interface FlowPanelProps {
    resetFlow: () => void;
    applyNetworkConfig: () => void;
    refreshMachines: () => void;
    isDirty: boolean;
    selectedAccountUuid: string;
    setSelectedAccountUuid: React.Dispatch<React.SetStateAction<string>>;
}

export default function FlowPanel({ resetFlow, applyNetworkConfig, isDirty, refreshMachines, selectedAccountUuid, setSelectedAccountUuid }: FlowPanelProps) {
    return (
        <>
            <Panel position="top-center">
                <Button.Group>
                    <NetworkWorkspaceSelect
                        selectedAccountUuid={selectedAccountUuid}
                        setSelectedAccountUuid={setSelectedAccountUuid}
                        classNames={{ input: cs(classes.button, classes.workspaceSelect) }}
                        isDirty={isDirty}
                    />
                    <ApplyRestoreButtonPair
                        isDirty={isDirty}
                        applyNetworkConfig={applyNetworkConfig}
                        resetFlow={resetFlow}
                    />
                    <RefreshFlowMachinesButton
                        refreshMachines={refreshMachines}
                        isDirty={isDirty}
                    />
                </Button.Group>
            </Panel>
        </>
    );
}
