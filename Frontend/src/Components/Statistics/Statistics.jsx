import React, { useState, useEffect } from 'react';
import { fetchStatistics } from '../../Services/service';
import './Statistics.css'; // Import the CSS file

const Statistics = () => {
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [statistics, setStatistics] = useState({
    totalSaleAmount: 0,
    totalSoldItems: 0,
    totalNotSoldItems: 0,
  });

  useEffect(() => {
    fetchStatistics(selectedMonth)
      .then(response => setStatistics(response.data))
      .catch(error => console.error('Error fetching statistics:', error));
  }, [selectedMonth]);

  return (
    <div className="main">
      <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
        {/* Options for months */}
        <option value="January">January</option>
        <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                    <option value="May">May</option>
                    <option value="June">June</option>
                    <option value="July">July</option>
                    <option value="August">August</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
        

      </select>
      <div className="statistics">
        <p className="total-sale">Total Sale Amount: {statistics.totalSaleAmount}</p>
        <p className="total-sold">Total Sold Items: {statistics.totalSoldItems}</p>
        <p className="total-not-sold">Total Not Sold Items: {statistics.totalNotSoldItems}</p>
      </div>
    </div>
  );
};

export default Statistics;
