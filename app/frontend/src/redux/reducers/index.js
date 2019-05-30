import {DATA_LOADED} from '../constants/action-types';

const initial = {
    eventServer: []
};

function rootReducer(state = initial, action){
    if(action.type === DATA_LOADED) {
        return {
            eventServer: action.payload
        };
    }

    return state;
}

export default rootReducer;
