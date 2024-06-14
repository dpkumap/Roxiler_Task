
import React, { useState, useEffect } from 'react';
import { fetchTransactions } from '../../Services/service';
import './TransactionsTable.css';

const TransactionsTable = () => {
    const [transactions, setTransactions] = useState([]);
    const [month, setMonth] = useState('March');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage] = useState(10);

    useEffect(() => {
        loadTransactions();
    }, [month, search, page]);

    const loadTransactions = () => {
        fetchTransactions(month, search, page, perPage).then(response => {
            setTransactions(response.data.transactions);
        }).catch(error => {
            console.error('Error fetching transactions:', error);
        });
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleMonthChange = (e) => {
        setMonth(e.target.value);
        setPage(1);
    };

    const handleNextPage = () => {
        setPage(prevPage => prevPage + 1);
    };

    const handlePrevPage = () => {
        setPage(prevPage => Math.max(prevPage - 1, 1));
    };

    return (
        <div className="transactions-table-container">
            <h2>Transaction Dashboard</h2>
            <div className='searchDrop'>
                <input 
                id='serachPr'
                    type="text" 
                    placeholder="Search transaction" 
                    value={search} 
                    onChange={handleSearchChange} 
                />
                <select className='droper' value={month} onChange={handleMonthChange}>
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
            </div>
            
            <table className='tbl'>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Sold</th>
                        <th>Image</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(transaction => (
                        <tr key={transaction._id}>
                            <td>{transaction._id}</td>
                            <td>{transaction.title}</td>
                            <td>{transaction.description}</td>
                            <td>{transaction.price}</td>
                            <td>{transaction.category}</td>
                            <td>{transaction.sold ? 'Yes' : 'No'}</td>
                            <td><img src={transaction.image} alt={transaction.title} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            

            <div>
                <button onClick={handlePrevPage}>Previous</button>
                <span>Page No: {page}</span>
                <button onClick={handleNextPage}>Next</button>
            </div>
        </div>
    );
};

export default TransactionsTable;


