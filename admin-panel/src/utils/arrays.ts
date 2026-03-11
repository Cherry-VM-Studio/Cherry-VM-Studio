import _ from "lodash";

export const findFirstGreaterThan = (arr: number[], x: number): number | undefined => {
    const index = _.sortedIndex(arr, x + 1);
    return arr[index];
};

export const findFirstLessThan = (arr: number[], x: number): number | undefined => {
    const index = _.sortedIndex(arr, x);
    return arr[index - 1];
};
