import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';

import './formsControl.css';

class Login extends Component{
    constructor(){
        super();
        this.state={
            errorRegistration: false,
            login:'',
            password:'',
            result: {
                errors: {},
                result: false
            }
        }
    }

    handleSubmit = (e) =>{
        e.preventDefault();
        const data = {
            login:this.state.login,
            password:this.state.password
        };

        fetch('/api/login',
            {
                method:'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(res=>res.json())
            .then(value=>{
                this.setState({
                    result: value
                })
            })
            .catch(error=>{
                console.log(error);
                this.setState({
                    errorRegistration: true
                })
            })
    };

    handleInputChange = (e) =>{
        this.setState({
            [e.target.name]: e.target.value
        })
    };

    successRedirect = () =>{
        setTimeout(()=>{
            localStorage.setItem('Authorization', this.state.result.token);
            window.location.reload();
        },1000)
    };

    render(){
        const {login, password, errorRegistration}= this.state;
        const {errors, result} = this.state.result;

        if(window.localStorage.Authorization) return <Redirect to='/'/>;
        if(result){
            this.successRedirect();
            return(
                <h3 className='successRegistration'>Вход успешен!</h3>
            );
        }
        if(errorRegistration) return(
            <h3 className='errorRegistration'>Ошибка, обратитесь к системному администратору</h3>
        );
        return(
            <form  onSubmit={this.handleSubmit} className='form'>
                <h3 className='titleForm'>Вход</h3>
                <input
                    type="text"
                    placeholder='Логин'
                    name='login'
                    onChange={this.handleInputChange}
                    value={login}
                    className={errors.login?'inputFormDanger':'inputForm'}
                />
                {errors.login && <i className='errorMessage'>{errors.login}</i>}
                <br/>
                <input
                    type="password"
                    placeholder='Пароль'
                    name='password'
                    onChange={this.handleInputChange}
                    value={password}
                    className={errors.password?'inputFormDanger':'inputForm'}
                />
                {errors.password && <i className='errorMessage'>{errors.password}</i>}
                <br/>
                <button className='buttonForm' type='submit'>
                    Отправить
                </button>
            </form>
        )
    }
}

export {Login};
