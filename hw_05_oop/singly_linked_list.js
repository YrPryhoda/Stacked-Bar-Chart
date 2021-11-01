class SinglyLinkedListItem {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

export class SinglyLinkedList {
    constructor() {
        this.head = null;
        this.listSize = 0;
    }

    get isEmpty() {
        return !this.head;
    }

    get size() {
        return this.listSize
    }

    toArray() {
        const result = [];

        if (this.isEmpty) {
            return result;
        }

        const recursive = (node) => {
            result.push(node.value);
            return node.next ? recursive(node.next) : result
        }

        return recursive(this.head);
    }

    prepend(value) {
        const newItem = new SinglyLinkedListItem(value);
        newItem.next = this.head;

        this.head = newItem;
        return this.listSize++;
    }

    contains(value) {
        let current = this.head;

        while (current) {
            if (current.value === value) {
                return true;
            }
            current = current.next;
        }

        return false;
    }

    indexOf(value) {
        let current = this.head;
        let index = 0;

        while (current) {
            if (current.value === value) {
                return index;
            }

            current = current.next;
            index++;
        }

        return -1;
    }

    at(position) {
        const arr = this.toArray();

        return arr[position];
    }

    clear() {
        this.head = 0;
        this.listSize = 0;
    }

    append(value) {
        const newItem = new SinglyLinkedListItem(value);

        const recursive = (node) => {
            if (node.next) {
                recursive(node.next)
            } else {
                node.next = newItem;
            }

        }

        if (this.isEmpty) {
            this.head = newItem;
        } else {
            recursive(this.head)
        }

        return this.listSize++;
    }

    replace(position, value) {
        const newItem = new SinglyLinkedListItem(value);
        let current = this.head;
        let prev;

        if (position === 0) {
            newItem.next = this.head.next
            this.head = newItem;
            return;
        }

        for (let i = 0; i < position; i++) {
            prev = current;
            current = current.next
        }

        newItem.next = current.next;
        prev.next = newItem;
        this.head = prev
    }

    insert(position, value) {
        const newItem = new SinglyLinkedListItem(value);
        let current = this.head;
        let prev;

        if (position === 0) {
            newItem.next = this.head
            this.head = newItem;
            return;
        }

        for (let i = 0; i < position; i++) {
            prev = current;
            current = current.next;
        }

        newItem.next = current;
        prev.next = newItem;
        this.listSize++;
    }

    remove(position) {
        let deleted;
        let current = this.head;
        let prev;

        if (position === 0) {
            deleted = this.head.value
            this.head = this.head.next;
        } else {
            for (let i = 0; i < position; i++) {
                prev = current;
                current = current.next;
            }

            deleted = current.value;
            prev.next = current && current.next;
        }

        this.listSize--;
        return deleted;
    }
}