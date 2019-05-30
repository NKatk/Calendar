import React, {Component} from 'react';
import {Link, Redirect} from 'react-router-dom';
import {getData} from "../../../redux/actions";
import {connect} from 'react-redux'

import './formNotation.css';

class NewNotation extends Component{
    constructor(){
        super();
        this.state = {
            errorRegistration: false,
            error: false,
            redirect: false,
            start: '',
            duration: '',
            title: '',
            result: {}
        }
    }


    handleChange = (e) =>{
        this.setState({
            [e.target.name]: e.target.value
        })
    };

    handleSubmit = (e) =>{
        e.preventDefault();
        if(!this.state.start || !this.state.duration || this.state.title.trim().length === 0){
            return this.setState({
                error: 'Заполните все поля'
            })
        }
        this.setState({
            error: null
        });

        const sendData = {
            start: this.state.start,
            duration: this.state.duration,
            title: this.state.title,
        };
        this.fetchData(sendData);
    };

    handleSubmitChange = (arr) =>{
        let error;
        if(!this.state.start && !this.state.duration && !this.state.title){
            error = true;
            return this.setState({
                error: 'Внесите изменения!'
            })
        }
        if(!this.state.start && !this.state.duration && this.state.title.trim().length === 0){
            return this.setState({
                error: 'Заполните все поля'
            })
        }
        const sendData = {
            id: arr._id,
            start: this.state.start || arr.start,
            duration: this.state.duration || arr.duration,
            title: this.state.title || arr.title,
        };
        this.setState({
            error: null
        });
        if(error) return;
        this.fetchData(sendData);
    };

    handleSubmitDelete = (id) =>{
        fetch('/api/deletenotation',
            {
                method:'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': window.localStorage.Authorization
                },
                body: JSON.stringify({id:id})
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

    fetchData = (obj) =>{
        let error;
        const adaptTime = (t) =>{

            let time = t.split(':');
            if((+time[0]) < 8){
                error = true;
                return this.setState({
                    error: 'События раньше 08:00 запрещены!'
                })
            }

            if((+time[0]) === 8){
                return (+time[1])
            }

            return ((+time[0])-8)*60+(+time[1])
        };



        if(adaptTime(obj.start) > adaptTime(obj.duration)){
            error = true;
            return this.setState({
                error: 'Событие не может заканчиваться раньше чем началось!'
            })
        }

        let duration = adaptTime(obj.duration) - adaptTime(obj.start);

        const sendData = {
            id: obj.id,
            start: adaptTime(obj.start),
            duration: duration,
            title: obj.title
        };

        if(error) return;

        fetch('/api/newnotation',
            {
                method:'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': window.localStorage.Authorization
                },
                body: JSON.stringify(sendData)
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
            });
    };

    componentDidMount(){
        this.props.getData();
    }

    eventFind = (id, arr) =>{
        let event, check;
        for(let i =0; arr.length > i; i++){
            if(arr[i]._id === id){
                event = Object.assign({}, arr[i])
            }
            check = true
        }


        if(event === undefined && check) return event = 'NotFound';
        if(event === undefined) return event;
        if(arr.length === 0) return event = 'NotFound';
        const adaptTime = (t) =>{

            if(t < 60){
                return '08:' + ('0' + t).slice(-2)
            }
            let minutes = t % 60;
            let hours  = (t - minutes) / 60 + 8;
            return ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2);
        };


        let duration = (+event.duration) + (+event.start);
        event.start = adaptTime(event.start);
        event.duration = adaptTime(duration);

        return event;

    };

    render(){

        const {start, duration, title, redirect, error, errorRegistration} = this.state;
        const {errors, result, resultDelete} = this.state.result;
        if(!window.localStorage.Authorization || redirect) return <Redirect to='/'/>;

        if(errorRegistration) {
            return(
                <h3 className='errorRegistration'>Ошибка, обратитесь к системному администратору</h3>
            );
        }

        if(result || resultDelete){
            setTimeout(()=>{
                this.setState({
                    redirect: true
                })
            },1000);
            if(result) {
                return (
                    <h3 className='successRegistration'>
                        Сохранение успешно!
                    </h3>

                );
            }
            return(
                <h3 className='successRegistration'  style={{backgroundColor: 'sandybrown'}}>
                    Удаление успешно!
                </h3>

            )
        }

        if(this.props.match.params.id){
            const event = this.eventFind(this.props.match.params.id,this.props.eventServer);
            if(this.props.eventServer.length !== 0 && typeof(event) === 'object'){
                return(
                    <form  className='formNotation'>
                        <div className='timeLabelInput'>
                            <label htmlFor="start" className='labelTimeStart'>Начало события </label>
                            <input
                                type="time"
                                value= {start?start:event.start}
                                name='start'
                                id='start'
                                className='inputTimeStart'
                                onChange={this.handleChange}
                            />
                            <br/>
                            <label htmlFor="duration" className='labelTimeEnd'>Конец события </label>
                            <input
                                type="time"
                                value={duration?duration:event.duration}
                                name='duration'
                                id='duration'
                                className='inputTimeEnd'
                                onChange={this.handleChange}
                            />
                        </div>

                        <input
                            style={{marginBottom: '35px'}}
                            type="text"
                            value={title?title:event.title}
                            name='title'
                            onChange={this.handleChange}
                            className='notationTitle'
                            placeholder='Введите название'
                        />
                        <div style={{marginBottom: '-10px', marginTop: '-30px'}}>
                        {error && <div><i className='errorMessage'>{error}</i></div>}
                        {errors && errors.map((item, i)=><div key={i}><i className='errorMessage'>{item}</i><br/></div>)}
                        </div>
                        <br/>
                        <span className='buttonChangeNotationSpan' onClick={()=>this.handleSubmitChange(event)}>Изменить</span>
                        <span className='buttonDeleteNotationSpan' onClick={()=>this.handleSubmitDelete(event._id)}>Удалить</span>
                        <Link style={{textDecoration: 'none', color: 'black'}} to='/'><span  className='buttonCancelNotationSpan'>Отменить</span></Link>
                    </form>
                )
            }else if(event === 'NotFound') {
                return (
                    <h3 className='errorRegistration'>Событие не найдено!</h3>
                );
            }
        }
        return(
            <form  className='formNotation' onSubmit={this.handleSubmit}>
                <div className='timeLabelInput'>
                    <label htmlFor="start" className='labelTimeStart'>Начало события </label>
                    <input
                        type="time"
                        value= {start}
                        name='start'
                        id='start'
                        className='inputTimeStart'
                        onChange={this.handleChange}
                    />
                    <br/>
                    <label htmlFor="duration" className='labelTimeEnd'>Конец события </label>
                    <input
                        type="time"
                        value={duration}
                        name='duration'
                        id='duration'
                        className='inputTimeEnd'
                        onChange={this.handleChange}
                    />
                </div>

                <input
                    style={{marginBottom: '25px'}}
                    type="text"
                    value={title}
                    name='title'
                    onChange={this.handleChange}
                    className='notationTitle'
                    placeholder='Введите название'
                />
                <div style={{marginBottom: '-15px', marginTop: '-20px'}}>
                    {error && <div><i className='errorMessage'>{error}</i></div>}
                    {errors && errors.map((item, i)=><div key={i}><i className='errorMessage'>{item}</i><br/></div>)}
                </div>
                <br/>
                <button className='buttonSendNotation' type='submit'>Отправить</button>
                <Link to='/'><button  className='buttonCancelNotation'>Отменить</button></Link>
            </form>
        )
    }
}


function mapStateToProps(state){
    return{
        eventServer: state.eventServer
    }
}

export default connect(
    mapStateToProps,
    {getData}
)(NewNotation);

