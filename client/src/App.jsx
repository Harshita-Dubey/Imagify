import React from 'react'
import { Routes, Route} from 'react-router-dom' 

import { ToastContainer} from 'react-toastify';

import Home from './pages/Home'
import Result from './pages/Result'
import BuyCredit from './pages/BuyCredit'
import Navbar from './components/navbar'
import Footer from './components/Footer.jsx'
import Login from './components/Login.jsx'
import { useContext } from 'react'
import { AppContext } from './context/appContext'

const App = () => {

  const {showLogin} = useContext(AppContext);
  console.log("showLogin:", showLogin)
  return (
    <div className='px-4 sm:px-10 md:px-14 lg:px-28 min-h-screen bg-gradient-to-b from-teal-50 to-orange-50'>
      <ToastContainer position='bottom-right'/>
     <Navbar/>
     { showLogin && (console.log("Rendering Login Component") || <Login/>) }

     

      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/result' element= {<Result/>}/>
        <Route path='/buy' element={ <BuyCredit/>}/>
      </Routes>
   <Footer/>
    </div>
  )
}

export default App
