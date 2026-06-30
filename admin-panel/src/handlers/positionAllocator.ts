import { Position } from "../pages/administrative/networks/NetworkPanelPage/reactFlow.types";

const DISTANCE_X = 200 as const;
const DISTANCE_Y = 200 as const;

export default class PositionAllocator {
    currentIndex: number = 0;
    #minY: number = 0;
    #maxX: number = 0;
    #maxY: number = 0;

    setBounds = (positions: Position[]) => {
        if (!positions.length) return;

        let [minY, maxY, maxX] = [0, 0, 0];

        positions.forEach(({ x, y }) => {
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
            if (x > maxX) maxX = x;
        });

        this.#minY = minY;
        this.#maxY = maxY;
        this.#maxX = maxX;

        this.currentIndex = 0;
    };

    getNumberOfRows = () => Math.max(Math.ceil((this.#maxY - this.#minY) / DISTANCE_Y), 1);

    getNext = (): Position => {
        const numberOfRows = this.getNumberOfRows();
        const row = this.currentIndex % numberOfRows;
        const col = Math.floor(this.currentIndex / numberOfRows);

        const x = (Math.ceil(this.#maxX / DISTANCE_X) + col + 1) * DISTANCE_X;
        const y = (Math.ceil(this.#minY / DISTANCE_Y) + row) * DISTANCE_Y;

        this.currentIndex++;
        return { x, y } as Position;
    };
}
