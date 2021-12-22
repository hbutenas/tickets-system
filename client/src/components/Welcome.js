import React, { Fragment, useState } from 'react';
import { Navigate } from 'react-router-dom';
import '../styles/css/welcome.css';

const Welcome = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // errorLogin shows only when user enters invalid credentials
  const [errorLogin, setErrorLogin] = useState(false);
  const [refreshToken, setRefreshToken] = useState('');

  const onSubmitForm = async (e) => {
    e.preventDefault();

    try {
      const settings = {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      };

      const response = await fetch(
        'http://localhost:5000/api/v1/auth/login',
        settings
      );

      const refreshToken = await response.json();

      if (response.status === 200) {
        setRefreshToken(refreshToken);
      }

      if (response.status === 400) {
        setRefreshToken('');
        setErrorLogin(true);
      }
    } catch (error) {
      console.log('ERROR', error);
    }
  };

  return (
    <Fragment>
      <h4 className='text-center'>Ticketing system v1</h4>
      <form
        className='d-flex mt-5 justify-content-center flex-column container w-50'
        onSubmit={onSubmitForm}
      >
        <input
          type='email'
          placeholder='Email'
          className='form-control'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type='password'
          placeholder='Password'
          className='form-control mt-2'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className='btn btn-success mt-3'>Sign in</button>
      </form>
      {refreshToken && <Navigate to='/dashboard' />}
    </Fragment>
  );
};

export default Welcome;
