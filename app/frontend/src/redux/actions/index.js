import {DATA_LOADED} from '../constants/action-types';

export function getData(){
    return function(dispatch){
        return fetch('/api/takeevents',
            {
                method:'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': window.localStorage.Authorization
                }
            })
            .then(response=>response.json())
            .then(value=>{
                if(!value.auth){
                    localStorage.setItem('Authorization', '');
                    return window.location.reload();
                }

                dispatch({type: DATA_LOADED, payload: value.result});
            })
            .catch(err=>console.log(err))
    }
}
