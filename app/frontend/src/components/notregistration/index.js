import React from 'react';
import {Link} from 'react-router-dom';

import './notregistration.css';


const NotRegistration = (props) =>{


    return(
        <div className='notRegistration'>
            <h3 className='notRegistrationTitle'>Вы не авторизованы</h3>
            <p><Link className='notRegistrationLink' to='/registration'>Зарегистрируйтесь</Link> или/и <Link className='notRegistrationLink' to='/login'>войдите</Link></p>
        </div>
    )
};

export default NotRegistration;
