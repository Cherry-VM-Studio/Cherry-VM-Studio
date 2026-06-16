export default class NumberAllocator {
    freeNumbers: number[] = [];
    currentMax: number = 0;

    setCurrent(current: number){
        this.currentMax = current;
    }

    remove(number: number) {
        if(number > this.currentMax) return;
        this.freeNumbers.push(number);
        this.freeNumbers.sort((a, b) => a - b);
    }

    getNext() {
        if (this.freeNumbers.length) return this.freeNumbers.shift(); 
        return ++this.currentMax;
    }
}
