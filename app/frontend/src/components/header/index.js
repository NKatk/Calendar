import React from 'react';
import {Link} from 'react-router-dom';

import './header.css';


const Header = (props) =>{
    const {auth, checkAuth} = props;
    const ClickExit = () => {
        localStorage.setItem('Authorization', '');
        checkAuth();
    };


    const authTrue = (
        <ul className='listNav'>
            <li className='listItem'>
                <Link className='navLink' to='' onClick={ClickExit}>Выйти</Link>
            </li>
        </ul>
    );


    const authFalse = (
        <ul className='listNav'>
            <li className='listItem'>
                <Link className='navLink' to='/login'>Войти</Link>
            </li>
            <li className='listItem'>
                <Link className='navLink' to='/registration'>Регистрация</Link>
            </li>
        </ul>
    );


    return(
        <div className='header'>
            <div>
                <Link className='navLink' to='/'>
                    <img src="/images/Calendar.ico" alt="Brand" className='brandNav'/>
                </Link>
            </div>
            {auth?authTrue:authFalse}
        </div>
    )
};


export default Header;
