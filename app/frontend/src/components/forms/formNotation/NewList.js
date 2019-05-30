import React, {Component} from 'react';
import {Link, Redirect} from 'react-router-dom';

import './formNotation.css';

class NewList extends Component{
    constructor(){
        super();
        this.state = {
            helpText: false,
            redirect: false,
            placeholder: 'Формат:\n[\n{start: 0, duration: 15, title: Exercise},\n...\n]',
            errorRegistration: false,
            error: false,
            json: '',
            result: {
                errors: [],
                result: false
            }
        }
    }

    handleChange = (e) =>{
        this.setState({
            [e.target.name]: e.target.value
        })
    };

    handleSubmit = (e) =>{
        e.preventDefault();

        let data = this.state.json.match(/{(.*?)\}/gi);

        let newArray = [];

        if(data !== null){
            try{
                for(let i =0; data.length > i; i++){
                    let obj =(eval("("+data[i]+")"));
                    newArray.push(obj)
                }
            }catch (err){
                this.setState({
                    error: "Не верный формат ввода!",
                })
            }

        }else{
            this.setState({
                error: true,
            })
        }

        if(newArray.length === 0){
            return this.setState({
                error: "Не верный формат ввода!",
            });
        }

        this.setState({
            error: false,
        });

        fetch('/api/newlist',
            {
                method:'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': window.localStorage.Authorization
                },
                body: JSON.stringify(newArray)
            })
            .then(res=>res.json())
            .then(value=>{
                if(!value.auth){
                    localStorage.setItem('Authorization', '');
                    window.location.reload();
                    return
                }

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

    render(){
        const {json, error, errorRegistration, redirect, helpText} = this.state;
        const {errors, result} = this.state.result;

        if(!window.localStorage.Authorization || redirect) return <Redirect to='/'/>;
        if(errorRegistration) {
            return(
                <h3 className='errorRegistration'>Ошибка, обратитесь к системному администратору</h3>
            );
        }
        if(result){
            setTimeout(()=>{
                this.setState({
                    redirect: true
                })
            },1000);
            return(
                <h3 className='successRegistration'>
                    Сохранение успешно!
                </h3>

            );
        }
        return(
            <form className='formNotation' onSubmit={this.handleSubmit}>
                <label
                    className='labelArea'
                    htmlFor='json'>
                        Добавьте ваш Файл
                </label>
                <br/>
                <textarea
                    style={{marginBottom: '25px'}}
                    className='textArea'
                    name="json"
                    id="json"
                    value={json}
                    onChange={this.handleChange}
                    placeholder={this.state.placeholder}
                />
                <div style={{marginBottom: '-15px', marginTop: '-20px'}}>
                    {error && <div><i className='errorMessage'>{error}</i></div>}
                    {errors && errors.map((item, i)=><div key={i}><i className='errorMessage'>{item}</i><br/></div>)}
                </div>
                <br/>
                <button className='buttonSendNotation'>Отправить</button>
                <Link to='/'><button  className='buttonCancelNotation'>Отменить</button></Link>
                <span className='buttonFAQ'
                      onClick={()=>{
                          let result = !helpText;
                          this.setState({helpText: result})
                      }}

                >?</span>
                {helpText && <div className='helpTextListOne'>Добавление нового документа удалит все события сохраненные ранее <br/>
                    Одновременно максимум два события <br/>
                    События длящиеся дольше 17:00 будут обрезаны <br/>
                    События начинающиеся позже 17.00(start: 541) запрещены</div>}
            </form>
        )
    }
}

export {NewList};
