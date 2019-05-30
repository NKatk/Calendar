import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';

import Header from './components/header';
import Body from './components/body';
import NotRegistration from './components/notregistration';
import NotFound from './components/notfound';
import {Login, NewList, Registration} from './components/forms';
import NewNotation from './components/forms/formNotation/NewNotation';

import './app.css'


class App extends Component{
    constructor(){
        super();
        this.state={
            auth: false,
            check: false
        };
    }

    componentDidMount(){
        this.checkAuth()
    }

    checkAuth = () =>{
        fetch('/api/checkauth',
            {
                method:'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': window.localStorage.Authorization
                },
                body: JSON.stringify({Authorization: window.localStorage.Authorization})
            })
            .then(res=>res.json())
            .then(value=>{
                this.setState({
                    auth: value.auth,
                    check: true
                })
            })
            .catch(error=>{
                console.log(error);

            });
    };

    render(){
        const {auth, check} = this.state;
        if(check)
            return(
                <div>
                    <Router>
                        <Header auth={auth} checkAuth={this.checkAuth}/>
                        <div className='content'>
                            <Switch>
                                <Route exact path='/' component={auth?Body:NotRegistration}/>
                                <Route exact path='/login' component={Login}/>
                                <Route exact path='/registration' component={Registration}/>
                                <Route exact path='/newnotation/:id?' component={NewNotation}/>
                                <Route exact path='/newlist' component={NewList}/>
                                <Route path='/*' component={NotFound}/>
                            </Switch>
                        </div>
                    </Router>
                </div>
            );
        return <i>Loading...</i>
    }
}

export default App;
