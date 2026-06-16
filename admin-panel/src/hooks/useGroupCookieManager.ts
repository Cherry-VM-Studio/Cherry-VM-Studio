import { useCookies } from "react-cookie";
import { toggleInArray } from "../utils/misc";

const useGroupCookieManager = (path: string) => {
    const [cookies, setCookies] = useCookies(['groupBy', 'closedGroups']);
    const groupBy = cookies.groupBy || 'group';
    const closedGroups = cookies.closedGroups || [];

    // setters for cookies
    const clearClosedGroups = () => 
        setCookies('closedGroups', [], { path: path });
    const toggleGroup = (groupName: string) => 
        setCookies('closedGroups', toggleInArray(closedGroups, groupName), { path: path });
    const setGroupBy = (groupName: string) => {
        setCookies('groupBy', groupName, { path: path })
        clearClosedGroups();
    }

    return { groupBy, closedGroups, toggleGroup, setGroupBy };
}

export default useGroupCookieManager;