class DoublyLinkedListItem {
    constructor(value) {
        this.value = value;
        this.next = null;
        this.prev = null;
    }
}

export class DoublyLinkedList {
    constructor() {
        this.head = null;
        this.listSize = 0;
    }

    get size() {
        return this.listSize;
    }

    get isEmpty() {
        return !this.head
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
        const newItem = new DoublyLinkedListItem(value);

        if (this.isEmpty) {
            this.head = newItem;
        } else {
            this.head.prev = newItem;
            newItem.next = this.head;
            this.head = newItem;
        }

        return this.listSize++;
    }

    contains(value) {
        let isContains = false;

        const recursive = (node) => {
            if (node.value === value) {
                isContains = true;
            } else {
                node.next && recursive(node.next)
            }

            return isContains;
        }

        return recursive(this.head)
    }

    indexOf(value) {
        let index = 0;
        let current = this.head;

        while (current) {
            if (current.value === value) {
                return index;
            }

            index++;
            current = current.next
        }

        return -1;
    }

    at(position) {
        const recursive = (node, index = 0) =>
            index === position ? node.value : recursive(node.next, index + 1)

        return recursive(this.head)
    }

    clear() {
        this.head = null;
        this.listSize = 0;
    }

    append(value) {
        const newItem = new DoublyLinkedListItem(value);
        const recursive = (node) => {
            if (node.next) {
                recursive(node.next)
            } else {
                newItem.prev = node;
                node.next = newItem;
            }
        }

        if (this.isEmpty) {
            this.head = newItem
        } else {
            recursive(this.head);
        }

        return this.listSize++
    }

    replace(position, value) {
        const newItem = new DoublyLinkedListItem(value);
        let current = this.head;
        let prev;

        if (this.isEmpty) {
            this.head = newItem
            return;
        }

        if (position === 0) {
            newItem.next = this.head.next;
            this.head = newItem
            return;
        }

        for (let i = 0; i < position; i++) {
            prev = current;
            current = current.next
        }

        prev.next = newItem;
        newItem.next = current ? current.next : null;
        current.prev = newItem;
    }

    insert(position, value) {
        const newItem = new DoublyLinkedListItem(value);
        let current = this.head;
        let prev;

        if (position === 0) {
            newItem.next = this.head
            this.head ? this.head.prev = newItem : null;
            this.head = newItem;
            return;
        }

        for (let i = 0; i < position; i++) {
            prev = current;
            current = current.next;
        }

        newItem.next = current;
        current ? current.prev = newItem : null;
        newItem.prev = prev;
        prev.next = newItem;
        this.listSize++;
    }

    remove(position) {
        let current = this.head;
        let prev;
        let deleted;

        if (position === 0) {
            deleted = this.head.value
            this.head = this.head.next;
            this.head ? this.head.prev = null : null;

            return deleted
        }

        for (let i = 0; i < position; i++) {
            prev = current;
            current = current.next;
        }

        deleted = prev.next.value;
        prev.next = current ? current.next : null;

        return deleted
    }
}