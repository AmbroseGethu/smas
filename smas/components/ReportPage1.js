"use client";
import { useState } from "react";
import styles from "../styles/reportPage1.module.css";

const columns = [
  { id: 0, visible: true },
  { id: 1, visible: true },
  { id: 2, visible: true },
  { id: 3, visible: true },
  { id: 4, visible: true },
  { id: 5, visible: true },
  { id: 6, visible: true },
  { id: 7, visible: true },
  { id: 8, visible: true },
  { id: 9, visible: true },
  { id: 10, visible: true },
  { id: 11, visible: true },
  { id: 12, visible: true },
  { id: 13, visible: true },
  { id: 14, visible: true },
  { id: 15, visible: true },
];
const row = [1];
function ReportPage1({ year }) {
  const [data, setData] = useState(columns);
  const [rows, setRows] = useState(row);
  const [column, setColumn] = useState([]);
  const onDelete = (index) => {
    const newData = [...data];
    newData[index].visible = !newData[index].visible;
    setData(newData);
  };
  const handleResetColumns = () => {
    const newData = [...data];
    newData.map((i) => (i.visible = true));
    setData(newData);
  };
  const addRows = (i) => {
    const newRow = [...rows];
    newRow.push(i);
    setRows(newRow);
  };
  const deleteNewRows = (id) => {
    const newData = rows.filter((i) => i !== id);
    setRows(newData);
  };
  const deleteColumn = (id) => {
    const newData = column.filter((i) => i !== id);
    setColumn(newData);
  };
  const addColumns = (i) => {
    const newColumn = [...column];
    newColumn.push(i);
    setColumn(newColumn);
  };
  return (
    <main className={styles.main}>
      <table className={styles.table}>
        {data[1].visible && (
          <tr>
            <td onClick={() => onDelete(1)} colSpan={17} className={styles.td}>
              <span style={{ fontWeight: "bold", fontSize: "20px" }}>
                Annexure - III
              </span>
            </td>
          </tr>
        )}
        {data[2].visible && (
          <tr>
            <td onClick={() => onDelete(2)} colSpan={17} className={styles.td}>
              <span style={{ fontWeight: "bold" }}>Name of the Dept:</span>
              <span style={{ marginLeft: 5 }}>Information Technology</span>
            </td>
          </tr>
        )}
        {data[3].visible && (
          <tr>
            <td onClick={() => onDelete(3)} colSpan={17} className={styles.td}>
              Statement of verification of stocks as on {year}
            </td>
          </tr>
        )}
        <tr>
          <td rowSpan={2} className={styles.td}>
            S.NO
          </td>
          <td colSpan={3} className={styles.td}>
            Stock Volume Register / Volume No./ Page No. /SI.No
          </td>
          {data[4].visible && (
            <td onClick={() => onDelete(4)} rowSpan={2} className={styles.td}>
              Stock Items and Description
            </td>
          )}
          {data[5].visible && (
            <td onClick={() => onDelete(5)} rowSpan={2} className={styles.td}>
              No. of Items
            </td>
          )}
          {data[6].visible && (
            <td onClick={() => onDelete(6)} rowSpan={2} className={styles.td}>
              Date of Purchases
            </td>
          )}
          {data[7].visible && (
            <td onClick={() => onDelete(7)} className={styles.td}>
              Purchase Value (Inclusive Tax)
            </td>
          )}
          {data[8].visible && (
            <td onClick={() => onDelete(8)} className={styles.td}>
              Rate of Description
            </td>
          )}
          {data[9].visible && (
            <td className={styles.td} onClick={() => onDelete(9)}>
              Deprication Value for the year 2021-2022
            </td>
          )}
          {}
          {data[10].visible && (
            <td onClick={() => onDelete(10)} className={styles.td}>
              Value of the item as on 31.03.2022
            </td>
          )}
          {data[11].visible && (
            <td onClick={() => onDelete(11)} className={styles.td}>
              Value of the item as on 31.03.2022
            </td>
          )}
          {data[12].visible && (
            <td onClick={() => onDelete(12)} rowSpan={2} className={styles.td}>
              Quantity
            </td>
          )}
          {data[13].visible && (
            <td onClick={() => onDelete(13)} className={styles.td}>
              Excess
            </td>
          )}
          {data[14].visible && (
            <td onClick={() => onDelete(14)} className={styles.td}>
              Shortage
            </td>
          )}
          {data[15].visible && (
            <td onClick={() => onDelete(15)} rowSpan={2} className={styles.td}>
              Remarks
            </td>
          )}
        </tr>
        <tr>
          <td className={styles.td}>Volume No</td>
          <td className={styles.td}>Page Number</td>
          <td className={styles.td}>Serial Number</td>
          {data[7].visible && (
            <td onClick={() => onDelete(7)} className={styles.td}>
              Rs
            </td>
          )}
          {data[8].visible && (
            <td onClick={() => onDelete(8)} className={styles.td}>
              Rs
            </td>
          )}
          {data[9].visible && (
            <td onClick={() => onDelete(9)} className={styles.td}>
              Rs
            </td>
          )}
          {data[10].visible && (
            <td onClick={() => onDelete(10)} className={styles.td}>
              Rs
            </td>
          )}
          {data[11].visible && (
            <td onClick={() => onDelete(11)} className={styles.td}>
              Rs
            </td>
          )}

          {data[13].visible && (
            <td onClick={() => onDelete(13)} className={styles.td}>
              Value of Actual in INR
            </td>
          )}
          {data[14].visible && (
            <td onClick={() => onDelete(14)} className={styles.td}>
              Quantity
            </td>
          )}
        </tr>
        {rows.map((i) => (
          <tr>
            <td
              onClick={() => deleteNewRows(i)}
              colSpan={17}
              className={styles.td}
            >
              Sample Text
            </td>
          </tr>
        ))}
      </table>
      <button onClick={handleResetColumns}>Reset All Columns</button>
      <button onClick={() => addRows(rows.length + 1)}>Add Rows</button>
      <button onClick={() => addColumns(column.length + 1)}>Add Columns</button>
    </main>
  );
}

export default ReportPage1;
