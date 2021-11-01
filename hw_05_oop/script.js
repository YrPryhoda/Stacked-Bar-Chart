import {assert} from './utils.js';
import {SinglyLinkedList} from './singly_linked_list.js';
import {DoublyLinkedList} from './doubly_linked_list.js';

const test = list => {
    console.group('given empty list');
    assert('size === 0', list.size, 0);
    assert('isEmpty === true', list.isEmpty, true);
    assert(
        'toArray() === []',
        list.toArray().join(','),
        ''
    );
    console.groupEnd();

    console.group('prepend');
    list.prepend('E');
    assert('size === 1', list.size, 1);
    assert('isEmpty === false', list.isEmpty, false);
    assert(
        'toArray() === "E"',
        list.toArray().join(','),
        'E'
    );
    list.prepend('B');
    assert('size === 2', list.size, 2);
    assert('isEmpty === false', list.isEmpty, false);
    assert(
        'toArray() === "B,E"',
        list.toArray().join(','),
        'B,E'
    );
    assert('contains("B")', list.contains('B'), true);
    assert('!contains("A")', list.contains('A'), false);
    assert('indexOf("B")', list.indexOf('B'), 0);
    assert('indexOf("A")', list.indexOf('A'), -1);
    assert('at(0) === "B"', list.at(0), 'B');
    assert('at(1) === "E"', list.at(1), 'E');
    console.groupEnd();

    console.group('clear');
    list.clear();
    assert('size === 0', list.size, 0);
    assert('isEmpty === true', list.isEmpty, true);
    assert(
        'toArray() === []',
        list.toArray().join(','),
        ''
    );
    console.groupEnd();

    console.group('append');
    list.append('D');
    list.append('A');
    assert('size === 2', list.size, 2);
    assert('!contains("B")', list.contains('B'), false);
    assert('contains("A")', list.contains('A'), true);
    assert('indexOf("B")', list.indexOf('B'), -1);
    assert('indexOf("A")', list.indexOf('A'), 1);
    assert('at(0) === "D"', list.at(0), 'D');
    assert('at(1) === "A"', list.at(1), 'A');
  //  assert('*[Symbol.iterator] === "D,A"', [...list].join(','), 'D,A');
    console.groupEnd();

    console.group('replace');
    list.replace(0, 'A');
    list.replace(1, 'B');
    assert('toArray() === "A,B"', list.toArray().join(','), 'A,B');
    console.groupEnd();

    console.group('insert');
    list.clear();
    list.insert(0, 'B');
    list.insert(0, 'A');
    list.insert(2, 'D');
    list.insert(2, 'C');
    assert('toArray() === "A,B,C,D"', list.toArray().join(','), 'A,B,C,D');
    console.groupEnd();

    console.group('remove');
    assert('remove(2)', list.remove(2), 'C');
    assert('remove(2)', list.remove(2), 'D');
    assert('remove(0)', list.remove(0), 'A');
    assert('remove(0)', list.remove(0), 'B');
    assert('isEmpty === true', list.isEmpty, true);
    console.groupEnd();

    console.group('sort');

    list.prepend('B'); // B
    list.append('D'); // B,D
    list.remove(1); // B
    list.append('E'); // B,E
    list.replace(1, 'C'); // B,C
    list.prepend('E'); // E,B,C
    list.insert(0, 'B'); // B,E,B,C
    list.replace(0, 'D'); // D,E,B,C
    list.insert(4, 'A'); // D,E,B,C,A

    assert(
        'toArray() === "D,E,B,C,A"',
        list.toArray().join(','),
        'D,E,B,C,A'
    );
    /*list.sort((a, b) => a > b);
    assert(
        'toArray() === "A,B,C,D,E"',
        list.toArray().join(','),
        'A,B,C,D,E'
    );*/
    console.groupEnd();
};

const singlyLinkedList = new SinglyLinkedList;
const doublyLinkedList = new DoublyLinkedList;

console.group('Singly Linked List');
test(singlyLinkedList);
console.groupEnd();

console.group('Doubly Linked List');
test(doublyLinkedList);
console.groupEnd();