import styles from '../App.module.css';
import React from 'react';
import { ReactComponent as Check } from '../resources/check.svg';
import { ReactComponent as UpArrow } from '../resources/up-arrow.svg';
import { ReactComponent as DownArrow } from '../resources/down-arrow.svg';
import { sortBy } from 'lodash';

const SORTS = {
    NONE: (list) => list,
    TITLE: (list) => sortBy(list, 'title'),
    AUTHOR: (list) => sortBy(list, 'author'),
    COMMENTS: (list) => sortBy(list, 'num_comments').reverse(),
    POINTS: (list) => sortBy(list, 'points').reverse(),
};

const ArrowDirection = ({ column, sort }) => {
    const size = '12';
    const columnMatch = column.toUpperCase();
    return (
        <div style={{ flexDirection: 'row' }}>
            {column}
            {
                columnMatch === sort.sortKey && sort.isReverse === true ? (
                    <DownArrow height={size} width={size} style={{ marginLeft: 5 }} />
                ) : (
                    ''
                )
            }
            {
                columnMatch === sort.sortKey && sort.isReverse === false ? (
                    <UpArrow height={size} width={size} style={{ marginLeft: 5 }} />
                ) : (
                    ''
                )
            }

        </div>
    );
};

const List = React.memo(
    ({ list, onRemoveItem }) => {

        const [sort, setSort] = React.useState({
            sortKey: 'NONE',
            isReverse: false,
        });

        const handleSort = (sortKey) => {
            const isReverse = sort.sortKey === sortKey && !sort.isReverse;
            setSort({ sortKey: sortKey, isReverse: isReverse });
        };

        const sortFunction = SORTS[sort.sortKey];
        const sortedList = sort.isReverse ? sortFunction(list).reverse() : sortFunction(list);

        return (
            <div>
                <div style={{ display: 'flex' }}>

                    <span style={{ width: '40%' }}>

                        <button
                            type="button"
                            onClick={() => handleSort('TITLE')}
                            style={{ backgroundColor: sort.sortKey === 'TITLE' ? '#D1C4E9' : 'white' }}
                        >
                            <ArrowDirection column={'Title'} sort={sort} />
                        </button>

                    </span>

                    <span style={{ width: '30%' }}>

                        <button
                            type="button"
                            onClick={() => handleSort('AUTHOR')}
                            style={{ background: sort.sortKey === 'AUTHOR' ? '#D1C4E9' : 'white' }}
                        >
                            <ArrowDirection column={'Author'} sort={sort} />
                        </button>

                    </span>


                    <span style={{ width: '10%' }}>
                        <button
                            type="button"
                            onClick={() => handleSort('COMMENTS')}
                            style={{ backgroundColor: sort.sortKey === 'COMMENTS' ? '#D1C4E9' : 'white' }}
                        >
                            <ArrowDirection column={'Comments'} sort={sort} />
                        </button>
                    </span>
                    <span style={{ width: '10%' }}>
                        <button
                            type="button"
                            onClick={() => handleSort('POINTS')}
                            style={{ backgroundColor: sort.sortKey === 'POINTS' ? '#D1C4E9' : 'white' }}
                        >

                            <ArrowDirection column={'Points'} sort={sort} />
                        </button>
                    </span>
                    <span style={{ width: '10%' }}> {'  '} </span>
                </div>

                {
                    sortedList.map((item) => (
                        <Item
                            key={item.objectID}
                            item={item}
                            onRemoveItem={onRemoveItem}
                        />
                    ))
                }

            </div>

        );
    });

const Item = React.memo(
    ({ item, onRemoveItem }) => {

        const handleRemoveItem = () => {
            onRemoveItem(item);
        };
        return (
            <li style={{ display: 'flex', marginTop: 10, marginBottom: 10 }}>
                <span style={{ width: '40%' }}>
                    <a href={item.url}>{item.title} </a>
                </span>
                <span style={{ width: '30%' }}>{item.author}</span>
                <span style={{ width: '10%' }}>{item.num_comments}</span>
                <span style={{ width: '10%' }}>{item.points}</span>
                <span style={{ width: '10%' }}>
                    <button
                        type="button"
                        onClick={handleRemoveItem}
                        className={`${styles.button} ${styles.buttonSmall}`}
                    >
                        Dismiss <Check height="14" width="14" />
                    </button>
                </span>
            </li>
        )
    });

export default List;