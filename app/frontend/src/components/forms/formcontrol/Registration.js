import React, {Component} from 'react';
import {Redirect} from 'react-router-dom'

import './formsControl.css';

class Registration extends Component{
    constructor(){
        super();
        this.state={
            redirect: false,
            errorRegistration: false,
            login:'',
            email:'',
            password:'',
            confpassword:'',
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
            email:this.state.email,
            password:this.state.password,
            confpassword:this.state.confpassword
        };

        fetch('/api/registration',
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
            this.setState({
                redirect: true
            })
        },1000)
    };

    render(){
        const {login, confpassword, email, password, errorRegistration, redirect} = this.state;
        const {result, errors} = this.state.result;

        if(redirect || window.localStorage.Authorization) return <Redirect to='/login'/>;
        if(result){
            this.successRedirect();
            return(
                <h3 className='successRegistration'>Регистрация успешна</h3>
            );
        }
        if(errorRegistration || errors.errDB) return(
            <h3 className='errorRegistration'>Ошибка, обратитесь к системному администратору</h3>
        );
        return(
            <form  onSubmit={this.handleSubmit} className='form'>
                <h3 className='titleForm'>Регистрация</h3>
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
                    type="email"
                    placeholder='Почта'
                    name='email'
                    onChange={this.handleInputChange}
                    value={email}
                    className={errors.email?'inputFormDanger':'inputForm'}
                />
                {errors.email && <i className='errorMessage'>{errors.email}</i>}
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
                <input
                    type="password"
                    placeholder='Повторите пароль'
                    name='confpassword'
                    onChange={this.handleInputChange}
                    value={confpassword}
                    className={errors.confpassword?'inputFormDanger':'inputForm'}
                />
                {errors.confpassword && <i className='errorMessage'>{errors.confpassword}</i>}
                <br/>
                <button className='buttonForm' type='submit'>
                    Отправить
                </button>
            </form>
        )
    }
}

export {Registration};
