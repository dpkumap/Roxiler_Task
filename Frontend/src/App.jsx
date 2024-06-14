import { useState } from 'react'

import './App.css'
import TransactionsTable from './Components/TransactionsTable/TransactionsTable'
import Statistics from './Components/Statistics/Statistics'
// import BarChart from './Components/Barchart/Barchart'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <div className="">
      <TransactionsTable/>
      <Statistics/>
      {/* <BarChart/> */}
     </div>
    </>
  )
}

export default App
