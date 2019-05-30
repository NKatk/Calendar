import React from 'react';
import {Link} from 'react-router-dom';

import './notfound.css';

const NotFound = () =>{


    return(
        <div  className='notfound'>
            <h3 className='textNotfound'>Страница не найдена</h3>
            <Link className='linkNotfound' to='/'>На главную</Link>
        </div>

    )
};

export default NotFound;
