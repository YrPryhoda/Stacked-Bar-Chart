Реалізувати одно- та двонаправлені списки у відповідних класах.
Інтерфейс класів має відповідати наступному:

```
    interface List {
        constructor(): List;

        get isEmpty: boolean;
        get size: number;
        
        append(value: any): void;
        at(position: number): any;
        clear(): void;
        contains(value: any): boolean;
        indexOf(value: any): number;
        insert(position: number, value: any): void;
        prepend(value: any): void;
        remove(position): any;
        replace(position: number, value: any): void;
        sort(compareFn: (a: any, b: any) => boolean): void;
        toArray(): any[];
        * [Symbol.iterator]();
    }
```
Зауважте, що класи вузлів `SinglyLinkedListItem` для однонаправленого та
`DoublyLinkedListItem` для двонаправленого списку повинні мати імутабельні властивість
`value`, тобто, змінювати її не можна (`next` та `prev` не є імутабельними)!
Для нового значення, як то в методі `replace`
створюється новий екземпляр класу `SinglyLinkedListItem` чи `DoublyLinkedListItem`.
Це ж саме стосується і методу `sort`.

Метод `sort` можна віднести до задачі підвищеної складності, робота без нього прийматися буде,
проте, бажано його реалізувати для відпрацювання навичок по роботі алгоритмів сортування.