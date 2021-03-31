import React, { ReactComponentElement } from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';

import styles from './index.less';
import { DeleteOutlined } from '@ant-design/icons';

type setItemInner = (value: string) => ReactComponentElement;
type sordEndParamsType = {
  oldIndex: number;
  newIndex: number;
};

type IProps = {
  items: any[];
  sortEnd?: ({ oldIndex, newIndex }: sordEndParamsType) => void;
  setItemInner: setItemInner;
  handleCaseDelete: (caseIndex: number) => void;
};

const SortableItem = SortableElement(
  ({ value, setItemInner, handleCaseDelete, caseIndex }: IProps & { value: any, caseIndex: number }) => {
    return (
      <div className={styles.item}>
        <div className={styles.inner}>
          <span className={styles.handle} />
          {setItemInner(value)}
          <DeleteOutlined onClick={() => handleCaseDelete(caseIndex)} />
        </div>
      </div>
    );
  },
);

const SortableWrapper = SortableContainer(
  ({ items, setItemInner, handleCaseDelete }: IProps) => {
    return (
      <div className={`${styles.container}`}>
        {items.map((value, index) => (
          <SortableItem
            key={index}
            index={index}
            caseIndex={index}
            value={value}
            setItemInner={setItemInner}
            handleCaseDelete={handleCaseDelete}
          />
        ))}
      </div>
    );
  },
);

const SortableList = ({ items, sortEnd, setItemInner, handleCaseDelete }: IProps) => {
  return (
    <div>
      <SortableWrapper
        onSortStart={(_, event) => event.preventDefault()}
        onSortEnd={sortEnd}
        items={items}
        helperClass={`${styles.helper}`}
        setItemInner={setItemInner}
        handleCaseDelete={handleCaseDelete}
        distance={1}
      />
    </div>
  );
};

SortableList.defaultProps = {
  theme: 'block',
  setItemInner: (value: string) => <span>{value}</span>,
};

export default SortableList;
