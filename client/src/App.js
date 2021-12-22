import React, { Fragment, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Components
import Welcome from './components/Welcome';
import Dashboard from './components/Dashboard';
import About from './components/About';
import Error from './components/Error';
import PrivateRoute from './components/PrivateRoute';
import { UserContext } from './components/UserContext';
function App() {
  const user = useContext({ loggedIn: true });

  return (
    <Router>
      {user?.loggedIn === true ? console.log('true') : console.log('false')}
      {console.log(UserContext)}
      <Routes>
        <Route path='/' element={<Welcome />} />
        <Route element={<PrivateRoute />}>
          <Route path='/dashboard' element={<Dashboard />} />
        </Route>
        {/* <Route path='/test' element={<PrivateRoute />} /> */}
        <Route path='/about' element={<About />} />
        <Route path='*' element={<Error />} />
      </Routes>
    </Router>
  );
}

export default App;
