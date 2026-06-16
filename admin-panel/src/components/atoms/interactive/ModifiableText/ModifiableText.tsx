import { IconCheck, IconPencil, IconX } from "@tabler/icons-react";
import React from "react";
import EdiText, { EdiTextProps } from "react-editext";

interface ModifiableTextProps extends EdiTextProps {}

const ModifiableText = ({ canEdit = true, ...props }: ModifiableTextProps): React.JSX.Element => {
    return (
        <EdiText
            type="text"
            hideIcons={true}
            canEdit={canEdit}
            editButtonContent={<IconPencil size={22} />}
            cancelButtonContent={<IconX size={22} />}
            saveButtonContent={<IconCheck size={22} />}
            buttonsContainerProps={{ style: { display: canEdit ? undefined : "none" } }}
            {...props}
        />
    );
};

export default ModifiableText;
